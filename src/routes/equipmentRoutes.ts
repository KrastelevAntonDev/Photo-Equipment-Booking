import { Router } from 'express';
import { EquipmentController } from '../controllers/EquipmentController';
import { validateDTO } from '../middlewares/validation';
import { CreateEquipmentDTO } from '../dtos/Equipment/CreateEquipmentDTO';

const router = Router();
const equipmentController = new EquipmentController();

router.get('/equipment', (req, res) => equipmentController.getAllEquipment(req, res));
router.post('/equipment', validateDTO(CreateEquipmentDTO), (req, res) => equipmentController.createEquipment(req, res));
// router.get('/equipment/:id', (req, res) => equipmentController.getEquipmentById(req, res));

export default router;