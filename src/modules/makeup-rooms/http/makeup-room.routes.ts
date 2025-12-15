import { Router } from 'express';
import { MakeupRoomController } from './makeup-room.controller';
import { requireAdminLevel } from '@shared/middlewares/admin.middleware';

const router = Router();
const controller = new MakeupRoomController();

// Публичные маршруты
router.get('/makeup-rooms', (req, res) => controller.getAll(req, res));
router.get('/makeup-rooms/:id', (req, res) => controller.getById(req, res));

// Админские маршруты
router.post('/admin/makeup-rooms', requireAdminLevel('partial'), (req, res) => controller.create(req, res));
router.put('/admin/makeup-rooms/:id', requireAdminLevel('partial'), (req, res) => controller.update(req, res));
router.delete('/admin/makeup-rooms/:id', requireAdminLevel('full'), (req, res) => controller.delete(req, res));

export default router;
