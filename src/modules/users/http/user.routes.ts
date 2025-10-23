import { Router } from 'express';
import { UserController } from './user.controller';
import { validateDTO } from '../../../shared/middlewares/validation.middleware';
import { CreateUserDTO } from './create-user.dto';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';

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