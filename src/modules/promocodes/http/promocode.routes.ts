import { Router } from 'express';
import { PromocodeController } from './promocode.controller';
import { PromocodeService } from '../application/promocode.service';
import { PromocodeMongoRepository } from '../infrastructure/promocode.mongo.repository';
import { getDB } from '../../../config/database';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';
import { adminMiddleware } from '../../../shared/middlewares/admin.middleware';

const router = Router();

// Инициализируем зависимости
const db = getDB();
const promocodeRepository = new PromocodeMongoRepository(db);
const promocodeService = new PromocodeService(promocodeRepository);
const promocodeController = new PromocodeController(promocodeService);

// Проверка валидности промокода - доступна авторизованным пользователям
router.post('/promocodes/validate', authMiddleware, promocodeController.validate.bind(promocodeController));

// CRUD операции - только для админов
router.post('/promocodes',  adminMiddleware, promocodeController.create.bind(promocodeController));
router.get('/promocodes',  adminMiddleware, promocodeController.getAll.bind(promocodeController));
router.get('/promocodes/:id',  adminMiddleware, promocodeController.getById.bind(promocodeController));
router.put('/promocodes/:id',  adminMiddleware, promocodeController.update.bind(promocodeController));
router.delete('/promocodes/:id',  adminMiddleware, promocodeController.delete.bind(promocodeController));

export default router;
