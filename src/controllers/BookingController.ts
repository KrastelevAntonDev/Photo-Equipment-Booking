import { Request, Response } from 'express';
import { BookingService } from '../services/BookingService';
import { Booking, BookingWithUser } from '../models/Booking';
import { RoomService } from '../services/RoomService';
import { UserJwtPayload } from '../models/User';

export class BookingController {
  private bookingService: BookingService;
	private roomService: RoomService;

  constructor() {
    this.bookingService = new BookingService();
		this.roomService = new RoomService();
  }

  async getAllBookings(req: Request, res: Response) {
    try {
      const bookings = await this.bookingService.getAllBookings();
      res.json(bookings);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errorMessage });
    }
  }

  async createBooking(req: Request & {user?: UserJwtPayload}, res: Response) {
    try {
      const booking: BookingWithUser = { ...req.body, user: req.user };
      const newBooking = await this.bookingService.createBooking(booking);
      res.status(201).json(newBooking);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(400).json({ message: errorMessage });
    }
  }

  async getBookingById(req: Request, res: Response) {
    try {
      const booking = await this.bookingService.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      res.json(booking);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errorMessage });
    }
  }

  async getBookingByIdRoom(req: Request, res: Response) {
    try {
      const room = await this.bookingService.getBookingByIdRoom(req.params.id);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      res.json(room);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errorMessage });
    }
  }
}