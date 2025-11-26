import { Db } from 'mongodb';
import { NotificationMongoRepository } from './infrastructure/notification.mongo.repository';
import { NotificationService } from './application/notification.service';
import { NotificationController } from './http/notification.controller';
import { BookingCancellationWorker } from './application/booking-cancellation.worker';
import { SmsService } from '../sms/application/sms.service';
import { Router } from 'express';
import { createNotificationRoutes } from './http/notification.routes';

/**
 * Singleton для модуля уведомлений
 */
class NotificationModule {
  private static instance: NotificationModule | null = null;
  private service: NotificationService | null = null;
  private repository: NotificationMongoRepository | null = null;
  private controller: NotificationController | null = null;
  private cancellationWorker: BookingCancellationWorker | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): NotificationModule {
    if (!NotificationModule.instance) {
      NotificationModule.instance = new NotificationModule();
    }
    return NotificationModule.instance;
  }

  /**
   * Инициализация модуля с зависимостями
   */
  async initialize(db: Db, smsService: SmsService): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ NotificationModule already initialized');
      return;
    }

    console.log('🚀 Initializing NotificationModule...');

    // Создаём репозиторий
    this.repository = new NotificationMongoRepository(db);

    // Создаём сервис
    this.service = new NotificationService(this.repository, smsService);
    
    // Инициализируем Bull очереди
    await this.service.initialize();

    // Создаём контроллер
    this.controller = new NotificationController(this.service, this.repository);

    // Создаём и запускаем worker для автоматической отмены бронирований
    this.cancellationWorker = new BookingCancellationWorker(this.repository);
    this.cancellationWorker.start();

    // Создаём индексы в MongoDB
    await this.createIndexes(db);

    this.isInitialized = true;
    console.log('✅ NotificationModule initialized');
  }

  /**
   * Получить сервис уведомлений
   */
  getService(): NotificationService {
    if (!this.service) {
      throw new Error('NotificationModule not initialized. Call initialize() first.');
    }
    return this.service;
  }

  /**
   * Получить контроллер уведомлений
   */
  getController(): NotificationController {
    if (!this.controller) {
      throw new Error('NotificationModule not initialized. Call initialize() first.');
    }
    return this.controller;
  }

  /**
   * Получить роуты
   */
  getRoutes(): Router {
    const controller = this.getController();
    return createNotificationRoutes(controller);
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    console.log('🔌 Shutting down NotificationModule...');

    // Останавливаем worker
    if (this.cancellationWorker) {
      this.cancellationWorker.stop();
      this.cancellationWorker = null;
    }

    // Закрываем очереди
    if (this.service) {
      await this.service.close();
    }

    this.service = null;
    this.repository = null;
    this.controller = null;
    this.isInitialized = false;

    console.log('✅ NotificationModule shut down');
  }

  /**
   * Создать индексы для оптимизации запросов
   */
  private async createIndexes(db: Db): Promise<void> {
    try {
      const collection = db.collection('notifications');

      await collection.createIndexes([
        // Индекс для поиска по бронированию
        { key: { bookingId: 1 }, name: 'bookingId_1' },
        
        // Индекс для поиска по пользователю
        { key: { userId: 1 }, name: 'userId_1' },
        
        // Индекс для поиска по статусу
        { key: { status: 1 }, name: 'status_1' },
        
        // Индекс для поиска готовых к отправке
        {
          key: { status: 1, scheduledFor: 1 },
          name: 'status_scheduledFor_1',
        },
        
        // Индекс для очистки старых записей
        { key: { createdAt: 1 }, name: 'createdAt_1' },
        
        // Уникальный индекс для предотвращения дублей
        {
          key: { bookingId: 1, type: 1 },
          name: 'bookingId_type_unique',
          unique: true,
          partialFilterExpression: {
            status: { $in: ['pending', 'sent', 'sending'] },
          },
        },
      ]);

      console.log('✅ Notification indexes created');
    } catch (error) {
      console.error('❌ Error creating notification indexes:', error);
      // Не падаем, если индексы не создались
    }
  }
}

export default NotificationModule;
