import { Router } from 'express';
import { PromocodeController } from './promocode.controller';
import { PromocodeService } from '../application/promocode.service';
import { PromocodeMongoRepository } from '../infrastructure/promocode.mongo.repository';
import { getDB } from '../../../config/database';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';
import { adminMiddleware } from '../../../shared/middlewares/admin.middleware';

const router = Router();

// Ленивая инициализация сервисов
let promocodeController: PromocodeController | null = null;

const getPromocodeController = () => {
  if (!promocodeController) {
    const db = getDB();
    const promocodeRepository = new PromocodeMongoRepository(db);
    const promocodeService = new PromocodeService(promocodeRepository);
    promocodeController = new PromocodeController(promocodeService);
  }
  return promocodeController;
};

// Проверка валидности промокода - доступна авторизованным пользователям
router.post('/promocodes/validate', authMiddleware, (req, res) => getPromocodeController().validate(req, res));

// CRUD операции - только для админов
router.post('/promocodes', adminMiddleware, (req, res) => getPromocodeController().create(req, res));
router.get('/promocodes', adminMiddleware, (req, res) => getPromocodeController().getAll(req, res));
router.get('/promocodes/:id', adminMiddleware, (req, res) => getPromocodeController().getById(req, res));
router.put('/promocodes/:id', adminMiddleware, (req, res) => getPromocodeController().update(req, res));
router.delete('/promocodes/:id', adminMiddleware, (req, res) => getPromocodeController().delete(req, res));

export default router;
