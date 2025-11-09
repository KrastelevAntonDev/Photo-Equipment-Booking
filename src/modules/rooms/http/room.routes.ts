import { Router } from 'express';
import { RoomController } from './room.controller';
import { validateDTO } from '@shared/middlewares/validation.middleware';
import { CreateRoomDTO } from './create-room.dto';
import { UpdateRoomDTO } from './update-room.dto';
import { adminMiddleware } from '@/shared/middlewares/admin.middleware';

const router = Router();
const roomController = new RoomController();

router.get('/rooms', (req, res) => roomController.getAllRooms(req, res));
router.post('/rooms', adminMiddleware, validateDTO(CreateRoomDTO), (req, res) => roomController.createRoom(req, res));
router.get('/rooms/:id', (req, res) => {
	roomController.getRoomById(req, res);
});

router.put('/rooms/:id', adminMiddleware, validateDTO(UpdateRoomDTO), (req, res) => {
	roomController.updateRoom(req, res);
});

export default router;