import { Request, Response } from 'express';
import { BookingService } from '../application/booking.service';
import { BookingWithUser } from '../domain/booking.entity';
import { RoomService } from '../../rooms/application/room.service';
import { UserJwtPayload } from '../../users/domain/user.entity';

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
  async getBusySlots(req: Request, res: Response) {
  try {
    const { roomId, start, end } = req.query;
    if (!roomId || !start || !end) {
      return res.status(400).json({ message: 'roomId, start, end required' });
    }
    const slots = await this.bookingService.getBusySlots(
      roomId as string,
      new Date(start as string),
      new Date(end as string)
    );
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
}
  async updateBooking(req: Request, res: Response) {
    try {
      const updated = await this.bookingService.updateBooking(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      res.json(updated);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const status = /already booked|End time/.test(errorMessage) ? 400 : 500;
      res.status(status).json({ message: errorMessage });
    }
  }

  async adminCreateBooking(req: Request, res: Response) {
    try {
      const { userId, roomId, equipmentIds, start, end, totalPrice, paymentMethod } = req.body as any;
      const newBooking = await this.bookingService.createBookingForUser(userId, {
        roomId,
        equipmentIds,
        start,
        end,
        totalPrice,
        paymentMethod,
      });
      res.status(201).json(newBooking);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const status = /already booked|User not found|Room not found|Equipment not found|End time|Invalid payment method/.test(errorMessage) ? 400 : 500;
      res.status(status).json({ message: errorMessage });
    }
  }
}