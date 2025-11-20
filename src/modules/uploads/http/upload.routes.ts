import { Router } from 'express';
import { UploadController } from './upload.controller';
import { adminMiddleware } from '@/shared/middlewares/admin.middleware';

const router = Router();
const controller = new UploadController();

// type: room|equipment, id: MongoId (query params)
router.post('/upload/image', adminMiddleware, (req, res, next) => controller.uploadImage(req, res, next));

export default router;
