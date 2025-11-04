import { Request, Response } from 'express';
import { UserService } from '../application/user.service';
import { User, UserJwtPayload } from '../domain/user.entity';
import { AdminCreateUserDTO } from './admin-create-user.dto';
import { BookingService } from '@modules/bookings/application/booking.service';

export class UserController {
  private userService: UserService;
  private bookingService: BookingService;

  constructor() {
    this.userService = new UserService();
    this.bookingService = new BookingService();
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
      // Подтягиваем полные объекты бронирований вместо одних ObjectId
      const bookings = await this.bookingService.getBookingsForUser(userId);
      // remove passwordHash и подменяем bookings для ответа
      const json = {
        ...user,
        passwordHash: undefined,
        bookings,
      };
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
  async getUserByIdRoom(req: Request, res: Response) {
        try {
      const users = await this.userService.getUserProfile(req.params.id);
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

  async adminCreateUser(req: Request, res: Response) {
    try {
      const { email, phone } = req.body as AdminCreateUserDTO;
      const created = await this.userService.createUserByAdmin({ email, phone });
      res.status(201).json(created);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const status = /already exists/i.test(message) ? 409 : 400;
      res.status(status).json({ message });
    }
  }
}