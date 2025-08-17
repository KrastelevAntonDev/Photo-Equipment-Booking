import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateDTO } from '../middlewares/validation';
import { RegisterDTO } from '../dtos/Auth/RegisterDTO';
import { LoginDTO } from '../dtos/Auth/LoginDTO';

const router = Router();
const authController = new AuthController();

router.post('/register', validateDTO(RegisterDTO), (req, res) => authController.register(req, res));
router.post('/login', validateDTO(LoginDTO), (req, res) => authController.login(req, res));

export default router;