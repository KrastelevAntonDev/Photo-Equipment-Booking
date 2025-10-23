import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateDTO } from '@shared/middlewares/validation.middleware';
import { RegisterDTO } from './register.dto';
import { LoginDTO } from './login.dto';

const router = Router();
const authController = new AuthController();

router.post('/register', validateDTO(RegisterDTO), (req, res) => authController.register(req, res));
router.post('/login', validateDTO(LoginDTO), (req, res) => authController.login(req, res));
router.post('/admin/login', validateDTO(LoginDTO), (req, res) => authController.adminLogin(req, res));

export default router;