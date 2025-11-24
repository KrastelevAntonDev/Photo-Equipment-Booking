import { Router } from 'express';
import { AtolController } from './atol.controller';
import { AtolService } from '../application/atol.service';
import { ReceiptMongoRepository } from '../infrastructure/receipt.mongo.repository';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';
import { requireAdminLevel } from '../../../shared/middlewares/admin.middleware';
import { validateDTO } from '../../../shared/middlewares/validation.middleware';
import { CreateReceiptDto } from './create-receipt.dto';

let controllerInstance: AtolController | null = null;

function getAtolController(): AtolController {
  if (!controllerInstance) {
    const atolService = new AtolService();
    const receiptRepository = new ReceiptMongoRepository();
    controllerInstance = new AtolController(atolService, receiptRepository);
  }
  return controllerInstance;
}

export const atolRoutes = Router();

// Все роуты доступны только для админов
atolRoutes.use(authMiddleware);
atolRoutes.use(requireAdminLevel('full'));

/**
 * @swagger
 * /admin/atol/receipts:
 *   post:
 *     summary: Создание фискального чека (только для админов)
 *     tags: [ATOL]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - paymentType
 *             properties:
 *               bookingId:
 *                 type: string
 *                 description: ID бронирования
 *               paymentType:
 *                 type: string
 *                 enum: [cash, card]
 *                 description: Способ оплаты (наличные или карта)
 *     responses:
 *       201:
 *         description: Чек создан
 *       400:
 *         description: Неверные параметры
 *       404:
 *         description: Бронирование не найдено
 */
atolRoutes.post('/admin/atol/receipts', validateDTO(CreateReceiptDto), (req, res) => {
  return getAtolController().createReceipt(req, res);
});

/**
 * @swagger
 * /admin/atol/receipts/{id}:
 *   get:
 *     summary: Получение чека по ID (только для админов)
 *     tags: [ATOL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные чека
 *       404:
 *         description: Чек не найден
 */
atolRoutes.get('/admin/atol/receipts/:id', (req, res) => {
  return getAtolController().getReceipt(req, res);
});

/**
 * @swagger
 * /admin/atol/receipts/booking/{bookingId}:
 *   get:
 *     summary: Получение всех чеков для бронирования (только для админов)
 *     tags: [ATOL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Список чеков
 */
atolRoutes.get('/admin/atol/receipts/booking/:bookingId', (req, res) => {
  return getAtolController().getReceiptsByBooking(req, res);
});

/**
 * @swagger
 * /admin/atol/receipts/{id}/refresh:
 *   post:
 *     summary: Обновление статуса чека из АТОЛ (только для админов)
 *     tags: [ATOL]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Обновлённые данные чека
 *       404:
 *         description: Чек не найден
 */
atolRoutes.post('/admin/atol/receipts/:id/refresh', (req, res) => {
  return getAtolController().refreshReceipt(req, res);
});
