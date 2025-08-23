import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { User, UserJwtPayload } from '../models/User';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }
  async getUserProfile(req: Request & { user?: UserJwtPayload }, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      console.log(req.user);
      
      const userId = req.user.userId;
      const user = await this.userService.getUserProfile(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      //remove passwordHash
      const json = {
        ...user,
        passwordHash: undefined
      }
      res.json(json);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errorMessage });
    }
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