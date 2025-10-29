import { Router } from 'express';
import { UserController } from './user.controller';
import { validateDTO } from '@shared/middlewares/validation.middleware';
import { CreateUserDTO } from './create-user.dto';
import { authMiddleware } from '@shared/middlewares/auth.middleware';
import { adminMiddleware, requireAdminLevel } from '@/shared/middlewares/admin.middleware';
import { AdminCreateUserDTO } from './admin-create-user.dto';

const router = Router();
const userController = new UserController();
router.get('/profile', authMiddleware, (req, res) => {
	userController.getUserProfile(req, res);
});
router.get('/users', adminMiddleware, (req, res) => {
	userController.getAllUsers(req, res);
});
router.get('/users/:id', adminMiddleware, (req, res) => {
	userController.getUserByIdRoom(req, res);
});
router.post('/user', validateDTO(CreateUserDTO), (req, res) => {
	userController.createUser(req, res);
});

// Admin creates a user (manager flow)
router.post('/admin/create-user', requireAdminLevel('partial'), validateDTO(AdminCreateUserDTO), (req, res) => {
  userController.adminCreateUser(req, res);
});

export default router;