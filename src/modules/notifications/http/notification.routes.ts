import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authMiddleware } from '@/shared/middlewares/auth.middleware';
import { adminMiddleware } from '@/shared/middlewares/admin.middleware';

/**
 * Создание роутов для модуля уведомлений
 * Доступны только администраторам
 */
export function createNotificationRoutes(controller: NotificationController): Router {
  const router = Router();

  // Все роуты требуют аутентификации и прав администратора
  router.use(authMiddleware);
  router.use(adminMiddleware);

  // GET /admin/notifications/stats - статистика
  router.get('/stats', controller.getStats);

  // GET /admin/notifications/health - health check
  router.get('/health', controller.healthCheck);

  // GET /admin/notifications/booking/:bookingId - уведомления по бронированию
  router.get('/booking/:bookingId', controller.getByBookingId);

  // POST /admin/notifications/cancel/:bookingId - отменить уведомления
  router.post('/cancel/:bookingId', controller.cancelByBookingId);

  return router;
}
