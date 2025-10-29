import { Router } from 'express';
import { EquipmentController } from './equipment.controller';
import { validateDTO } from '@shared/middlewares/validation.middleware';
import { CreateEquipmentDTO } from './create-equipment.dto';

import { adminMiddleware } from '@/shared/middlewares/admin.middleware';

const router = Router();
const equipmentController = new EquipmentController();

router.get('/equipment', (req, res) => equipmentController.getAllEquipment(req, res));
router.post('/equipment', adminMiddleware, validateDTO(CreateEquipmentDTO), (req, res) => equipmentController.createEquipment(req, res));
// router.get('/equipment/:id', (req, res) => equipmentController.getEquipmentById(req, res));

export default router;