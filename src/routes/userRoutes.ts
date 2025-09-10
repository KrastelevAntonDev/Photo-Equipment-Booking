import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { validateDTO } from '../middlewares/validation';
import { CreateUserDTO } from '../dtos/User/CreateUserDTO';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const userController = new UserController();
router.get('/profile', authMiddleware, (req, res) => {
	userController.getUserProfile(req, res);
});
router.get('/users', (req, res) => {
	userController.getAllUsers(req, res);
});
router.get('/users/:id', (req, res) => {
	userController.getUserByIdRoom(req, res);
});
router.post('/user', validateDTO(CreateUserDTO), (req, res) => {
	userController.createUser(req, res);
});

export default router;