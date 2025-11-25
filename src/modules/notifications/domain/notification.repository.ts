import { ObjectId } from 'mongodb';
import { NotificationEntity, NotificationStatus, NotificationType } from './notification.entity';

/**
 * Интерфейс репозитория уведомлений
 */
export interface NotificationRepository {
  /**
   * Создать новое уведомление
   */
  create(notification: NotificationEntity): Promise<NotificationEntity>;

  /**
   * Найти уведомление по ID
   */
  findById(id: ObjectId): Promise<NotificationEntity | null>;

  /**
   * Найти все уведомления для бронирования
   */
  findByBookingId(bookingId: ObjectId): Promise<NotificationEntity[]>;

  /**
   * Найти уведомления по статусу
   */
  findByStatus(status: NotificationStatus): Promise<NotificationEntity[]>;

  /**
   * Найти уведомления, готовые к отправке
   * (статус SCHEDULED, scheduledFor <= now)
   */
  findReadyToSend(now: Date): Promise<NotificationEntity[]>;

  /**
   * Проверить, существует ли уведомление
   */
  exists(bookingId: ObjectId, type: NotificationType): Promise<boolean>;

  /**
   * Обновить статус уведомления
   */
  updateStatus(
    id: ObjectId,
    status: NotificationStatus,
    data?: {
      sentAt?: Date;
      lastError?: string;
      attempts?: number;
      jobId?: string;
    }
  ): Promise<void>;

  /**
   * Отметить как отправленное
   */
  markAsSent(id: ObjectId, sentAt: Date, smsId?: string): Promise<void>;

  /**
   * Отметить как проваленное
   */
  markAsFailed(id: ObjectId, error: string, attempts: number): Promise<void>;

  /**
   * Отменить уведомления для бронирования
   */
  cancelByBookingId(bookingId: ObjectId): Promise<number>;

  /**
   * Удалить старые уведомления (для очистки)
   */
  deleteOlderThan(date: Date): Promise<number>;

  /**
   * Получить статистику по уведомлениям
   */
  getStats(): Promise<{
    total: number;
    byStatus: Record<NotificationStatus, number>;
    byType: Record<NotificationType, number>;
    failureRate: number;
  }>;
}
