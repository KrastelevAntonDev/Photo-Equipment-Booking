import { Router } from 'express';
import { RoomController } from '../controllers/RoomController';
import { validateDTO } from '../middlewares/validation';
import { CreateRoomDTO } from '../dtos/Room/CreateRoomDTO';

const router = Router();
const roomController = new RoomController();

router.get('/rooms', (req, res) => roomController.getAllRooms(req, res));
router.post('/rooms', validateDTO(CreateRoomDTO), (req, res) => roomController.createRoom(req, res));
// router.get('/rooms/:id', (req, res) => roomController.getRoomById(req, res));

export default router;