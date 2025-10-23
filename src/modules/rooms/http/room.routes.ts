import { Router } from 'express';
import { RoomController } from './room.controller';
import { validateDTO } from '@shared/middlewares/validation.middleware';
import { CreateRoomDTO } from './create-room.dto';

const router = Router();
const roomController = new RoomController();

router.get('/rooms', (req, res) => roomController.getAllRooms(req, res));
router.post('/rooms', validateDTO(CreateRoomDTO), (req, res) => roomController.createRoom(req, res));
// router.get('/rooms/:id', (req, res) => roomController.getRoomById(req, res));

export default router;