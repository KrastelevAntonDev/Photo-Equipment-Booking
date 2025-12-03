import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { NotificationService } from '../application/notification.service';
import { NotificationMongoRepository } from '../infrastructure/notification.mongo.repository';
import { SmsService } from '@modules/sms/application/sms.service';
import { authMiddleware } from '@/shared/middlewares/auth.middleware';
import { adminMiddleware } from '@/shared/middlewares/admin.middleware';
import { getDB } from '@/config/database';

const router = Router();

// Ленивая инициализация зависимостей - создаём при первом обращении
let notificationController: NotificationController | null = null;

function getController(): NotificationController {
  if (!notificationController) {
    const db = getDB();
    const notificationRepository = new NotificationMongoRepository(db);
    const smsService = new SmsService();
    const notificationService = new NotificationService(notificationRepository, smsService);
    notificationController = new NotificationController(notificationService, notificationRepository);
  }
  return notificationController;
}

// Все роуты требуют аутентификации и прав администратора
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /admin/notifications/stats - статистика
router.get('/stats', (req, res) => getController().getStats(req, res));

// GET /admin/notifications/health - health check
router.get('/health', (req, res) => getController().healthCheck(req, res));

// GET /admin/notifications/booking/:bookingId - уведомления по бронированию
router.get('/booking/:bookingId', (req, res) => getController().getByBookingId(req, res));

// POST /admin/notifications/cancel/:bookingId - отменить уведомления
router.post('/cancel/:bookingId', (req, res) => getController().cancelByBookingId(req, res));

export default router;
