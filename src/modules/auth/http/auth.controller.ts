import { Request, Response } from 'express';
import { AuthService } from '../application/auth.service';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(req: Request, res: Response) {
    try {
      const { email, password, phone, fullName } = req.body;
      const user = await this.authService.register(email, password, phone, fullName);
      res.status(201).json({ message: 'User registered', user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(400).json({ message: errorMessage });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { token } = await this.authService.login(email, password);
      res.json({ token });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(400).json({ message: errorMessage });
    }
  }

  async adminLogin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { token } = await this.authService.adminLogin(email, password);
      res.json({ token });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(400).json({ message: errorMessage });
    }
  }
}