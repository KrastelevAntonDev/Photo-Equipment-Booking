import { Request, Response } from 'express';
import { BookingService } from '../services/BookingService';
import { Booking } from '../models/Booking';

export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
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

  async createBooking(req: Request, res: Response) {
    try {
      const booking: Booking = req.body;
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
}