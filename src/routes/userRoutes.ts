import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { validateDTO } from '../middlewares/validation';
import { CreateUserDTO } from '../dtos/User/CreateUserDTO';

const router = Router();
const userController = new UserController();

router.get('/users', (req, res) => userController.getAllUsers(req, res));
router.post('/user', validateDTO(CreateUserDTO), (req, res) => userController.createUser(req, res));

export default router;