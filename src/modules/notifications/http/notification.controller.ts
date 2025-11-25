import { Request, Response } from 'express';
import { NotificationService } from '../application/notification.service';
import { NotificationRepository } from '../domain/notification.repository';

/**
 * HTTP контроллер для мониторинга и управления уведомлениями
 */
export class NotificationController {
  constructor(
    private notificationService: NotificationService,
    private notificationRepository: NotificationRepository
  ) {}

  /**
   * GET /admin/notifications/stats
   * Получить статистику уведомлений
   */
  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const [dbStats, queueStats] = await Promise.all([
        this.notificationRepository.getStats(),
        this.notificationService.getQueueStats(),
      ]);

      res.json({
        success: true,
        data: {
          database: dbStats,
          queues: queueStats,
        },
      });
    } catch (error: any) {
      console.error('Error getting notification stats:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * GET /admin/notifications/booking/:bookingId
   * Получить все уведомления для бронирования
   */
  getByBookingId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bookingId } = req.params;
      const { ObjectId } = require('mongodb');
      
      if (!ObjectId.isValid(bookingId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid booking ID',
        });
        return;
      }

      const notifications = await this.notificationRepository.findByBookingId(
        new ObjectId(bookingId)
      );

      res.json({
        success: true,
        data: notifications,
      });
    } catch (error: any) {
      console.error('Error getting notifications by booking ID:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * POST /admin/notifications/cancel/:bookingId
   * Отменить все уведомления для бронирования
   */
  cancelByBookingId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bookingId } = req.params;
      const { ObjectId } = require('mongodb');
      
      if (!ObjectId.isValid(bookingId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid booking ID',
        });
        return;
      }

      const cancelled = await this.notificationService.cancelNotifications(
        new ObjectId(bookingId)
      );

      res.json({
        success: true,
        data: {
          cancelled,
        },
      });
    } catch (error: any) {
      console.error('Error cancelling notifications:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * GET /admin/notifications/health
   * Проверка здоровья системы уведомлений
   */
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const RedisClient = require('../../../config/redis').default;
      const redisHealthy = await RedisClient.healthCheck();

      const queueStats = await this.notificationService.getQueueStats();
      const totalActive = Object.values(queueStats).reduce(
        (sum: number, queue: any) => sum + (queue.active || 0),
        0
      );

      const healthy = redisHealthy && totalActive < 1000; // Произвольный порог

      res.status(healthy ? 200 : 503).json({
        success: healthy,
        data: {
          redis: redisHealthy,
          activeJobs: totalActive,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      console.error('Health check error:', error);
      res.status(503).json({
        success: false,
        error: error.message,
      });
    }
  };
}
