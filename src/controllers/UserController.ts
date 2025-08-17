import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { User } from '../models/User';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errorMessage });
    }
  }
  async createUser(req: Request, res: Response) {
    try {
      const user: User = req.body;
      const newUser = await this.userService.createUser(user);
      res.status(201).json(newUser);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errorMessage });
    }
  }
}