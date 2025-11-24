import { Router } from 'express';
import { EquipmentController } from './equipment.controller';
import { validateDTO } from '@shared/middlewares/validation.middleware';
import { CreateEquipmentDTO } from './create-equipment.dto';
import { UpdateEquipmentDTO } from './update-equipment.dto';

import { adminMiddleware } from '@/shared/middlewares/admin.middleware';

const router = Router();
const equipmentController = new EquipmentController();

router.get('/equipment', (req, res) => equipmentController.getAllEquipment(req, res));
router.get('/admin/equipment', adminMiddleware, (req, res) => equipmentController.getAllEquipmentForAdmin(req, res));
router.post('/equipment', adminMiddleware, validateDTO(CreateEquipmentDTO), (req, res) => equipmentController.createEquipment(req, res));
// router.get('/equipment/:id', (req, res) => equipmentController.getEquipmentById(req, res));
router.put('/equipment/:id', adminMiddleware, validateDTO(UpdateEquipmentDTO), (req, res) => equipmentController.updateEquipment(req, res));
router.delete('/equipment/:id', adminMiddleware, (req, res) => equipmentController.deleteEquipment(req, res));

export default router;