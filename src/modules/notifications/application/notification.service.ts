import Queue, { Job, JobOptions } from 'bull';
import { ObjectId } from 'mongodb';
import RedisClient from '../../../config/redis';
import {
  CreateNotificationPayload,
  NotificationEntity,
  NotificationPriority,
  NotificationResult,
  NotificationStatus,
  NotificationType,
} from '../domain/notification.entity';
import { NotificationRepository } from '../domain/notification.repository';
import { SmsService } from '../../sms/application/sms.service';
import { NotificationTemplateService, BookingTemplateData } from './notification-template.service';

/**
 * Payload для задачи в очереди
 */
interface NotificationJobData {
  notificationId: string;
  bookingId: string;
  userId: string;
  type: NotificationType;
  phoneNumber: string;
  templateData: BookingTemplateData;
}

/**
 * Главный сервис уведомлений с Bull Queue
 */
export class NotificationService {
  private queues: Map<NotificationType, Queue.Queue<NotificationJobData>> = new Map();
  private isInitialized = false;
  private templateService: NotificationTemplateService;

  constructor(
    private notificationRepository: NotificationRepository,
    private smsService: SmsService
  ) {
    this.templateService = new NotificationTemplateService();
  }

  /**
   * Инициализация очередей Bull
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    const redis = RedisClient.getInstance();

    // Создаём отдельную очередь для каждого типа уведомления
    const notificationTypes = Object.values(NotificationType);
    
    for (const type of notificationTypes) {
      const queue = new Queue<NotificationJobData>(`notifications:${type}`, {
        redis: {
          host: redis.options.host,
          port: redis.options.port,
          password: redis.options.password,
          db: redis.options.db,
        },
        defaultJobOptions: this.getJobOptions(type),
      });

      // Обработчик задач для этой очереди
      queue.process(this.getProcessorConcurrency(type), async (job: Job<NotificationJobData>) => {
        return this.processNotification(job);
      });

      // Event listeners для мониторинга
      this.setupQueueEventListeners(queue, type);

      this.queues.set(type, queue);
    }

    this.isInitialized = true;
    console.log('✅ Notification queues initialized');
  }

  /**
   * Создать и запланировать уведомление
   */
  async scheduleNotification(
    payload: CreateNotificationPayload,
    templateData: BookingTemplateData
  ): Promise<NotificationEntity> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Проверяем, не существует ли уже такое уведомление
    const exists = await this.notificationRepository.exists(payload.bookingId, payload.type);
    if (exists) {
      throw new Error(`Notification of type ${payload.type} already exists for booking ${payload.bookingId}`);
    }

    // Генерируем сообщение
    const message = this.templateService.generateMessage(payload.type, templateData);

    // Создаём запись в БД
    const notification: NotificationEntity = {
      bookingId: payload.bookingId,
      userId: payload.userId,
      type: payload.type,
      status: NotificationStatus.PENDING,
      priority: payload.priority || this.getDefaultPriority(payload.type),
      phoneNumber: payload.phoneNumber,
      message,
      scheduledFor: payload.scheduledFor,
      attempts: 0,
      maxAttempts: 3,
      metadata: payload.metadata || { templateData },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = await this.notificationRepository.create(notification);

    // Добавляем в очередь Bull
    const delay = Math.max(0, payload.scheduledFor.getTime() - Date.now());
    const queue = this.queues.get(payload.type);
    
    if (!queue) {
      throw new Error(`Queue not found for notification type: ${payload.type}`);
    }

    const job = await queue.add(
      {
        notificationId: created._id!.toString(),
        bookingId: payload.bookingId.toString(),
        userId: payload.userId.toString(),
        type: payload.type,
        phoneNumber: payload.phoneNumber,
        templateData,
      },
      {
        delay,
        jobId: created._id!.toString(), // Используем ID уведомления как ID задачи
        priority: created.priority,
      }
    );

    // Обновляем статус и jobId
    await this.notificationRepository.updateStatus(created._id!, NotificationStatus.SCHEDULED, {
      jobId: job.id as string,
    });

    console.log(`📅 Scheduled ${payload.type} notification for booking ${payload.bookingId} (delay: ${delay}ms)`);

    return created;
  }

  /**
   * Обработка уведомления (вызывается Bull processor)
   */
  private async processNotification(job: Job<NotificationJobData>): Promise<NotificationResult> {
    const { notificationId, phoneNumber, type, templateData } = job.data;
    const objId = new ObjectId(notificationId);

    console.log(`📤 Processing notification ${notificationId} (${type})`);

    try {
      // Обновляем статус
      await this.notificationRepository.updateStatus(objId, NotificationStatus.PROCESSING, {
        attempts: job.attemptsMade + 1,
      });

      // Генерируем сообщение
      const message = this.templateService.generateMessage(type, templateData);

      // Отправляем SMS
      const smsResult = await this.smsService.send({
        sms: [{
          phone: phoneNumber,
          text: message,
          channel: 'digit',
        }],
      });

      if (!smsResult.providerResponse || smsResult.messages.length === 0) {
        throw new Error('SMS sending failed');
      }

      // Помечаем как отправленное
      const sentAt = new Date();
      const smsId = smsResult.messages[0]?._id?.toString();
      await this.notificationRepository.markAsSent(objId, sentAt, smsId);

      console.log(`✅ Notification ${notificationId} sent successfully`);

      return {
        notificationId: objId,
        success: true,
        sentAt,
        smsId: smsResult.messages[0]?._id?.toString(),
      };
    } catch (error: any) {
      console.error(`❌ Failed to send notification ${notificationId}:`, error);

      const attempts = job.attemptsMade + 1;
      
      // Если превышен лимит попыток, помечаем как проваленное
      if (attempts >= 3) {
        await this.notificationRepository.markAsFailed(objId, error.message, attempts);
      } else {
        await this.notificationRepository.updateStatus(objId, NotificationStatus.SCHEDULED, {
          lastError: error.message,
          attempts,
        });
      }

      throw error; // Bull автоматически повторит задачу
    }
  }

  /**
   * Отменить все уведомления для бронирования
   */
  async cancelNotifications(bookingId: ObjectId): Promise<number> {
    // Отменяем в базе данных
    const cancelled = await this.notificationRepository.cancelByBookingId(bookingId);

    // Удаляем задачи из очередей Bull
    for (const queue of this.queues.values()) {
      const jobs = await queue.getJobs(['waiting', 'delayed', 'active']);
      for (const job of jobs) {
        if (job.data.bookingId === bookingId.toString()) {
          await job.remove();
        }
      }
    }

    console.log(`🚫 Cancelled ${cancelled} notifications for booking ${bookingId}`);
    return cancelled;
  }

  /**
   * Получить статистику очередей
   */
  async getQueueStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};

    for (const [type, queue] of this.queues.entries()) {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
      ]);

      stats[type] = {
        waiting,
        active,
        completed,
        failed,
        delayed,
        total: waiting + active + completed + failed + delayed,
      };
    }

    return stats;
  }

  /**
   * Graceful shutdown
   */
  async close(): Promise<void> {
    console.log('🔌 Closing notification queues...');

    for (const [type, queue] of this.queues.entries()) {
      try {
        await queue.close();
        console.log(`✅ Queue ${type} closed`);
      } catch (error) {
        console.error(`❌ Error closing queue ${type}:`, error);
      }
    }

    this.queues.clear();
    this.isInitialized = false;
    console.log('✅ All notification queues closed');
  }

  /**
   * Получить настройки задач для типа уведомления
   */
  private getJobOptions(_type: NotificationType): JobOptions {
    return {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000, // Начальная задержка 2 секунды
      },
      removeOnComplete: 100, // Хранить последние 100 выполненных
      removeOnFail: 500,     // Хранить последние 500 проваленных
    };
  }

  /**
   * Получить количество одновременных обработчиков
   */
  private getProcessorConcurrency(type: NotificationType): number {
    // Критичные уведомления обрабатываем с большим параллелизмом
    switch (type) {
      case NotificationType.PAYMENT_CANCELLED_2H:
        return 5;
      case NotificationType.PAYMENT_FULL_CONFIRMED:
      case NotificationType.PAYMENT_HALF_CONFIRMED:
        return 3;
      default:
        return 2;
    }
  }

  /**
   * Получить приоритет по умолчанию
   */
  private getDefaultPriority(type: NotificationType): NotificationPriority {
    switch (type) {
      case NotificationType.PAYMENT_CANCELLED_2H:
        return NotificationPriority.CRITICAL;
      case NotificationType.PAYMENT_FULL_CONFIRMED:
      case NotificationType.PAYMENT_HALF_CONFIRMED:
        return NotificationPriority.HIGH;
      case NotificationType.PAYMENT_WARNING_1H:
        return NotificationPriority.NORMAL;
      default:
        return NotificationPriority.NORMAL;
    }
  }

  /**
   * Настройка event listeners для очереди
   */
  private setupQueueEventListeners(queue: Queue.Queue, type: NotificationType): void {
    queue.on('completed', (job, result) => {
      console.log(`✅ [${type}] Job ${job.id} completed:`, result);
    });

    queue.on('failed', (job, err) => {
      console.error(`❌ [${type}] Job ${job?.id} failed:`, err.message);
    });

    queue.on('stalled', (job) => {
      console.warn(`⚠️ [${type}] Job ${job.id} stalled`);
    });

    queue.on('error', (error) => {
      console.error(`❌ [${type}] Queue error:`, error);
    });
  }
}
