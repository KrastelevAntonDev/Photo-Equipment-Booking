import { Request, Response } from 'express';
import { BookingService } from '../application/booking.service';
import { BookingWithUser } from '../domain/booking.entity';
import { RoomService } from '../../rooms/application/room.service';
import { UserJwtPayload } from '../../users/domain/user.entity';
import { UserService } from '../../users/application/user.service';

interface GuestUserData {
  clientEmail: string;
  clientPhone: string;
  clientFio: string;
}

export class BookingController {
  private bookingService: BookingService;
	private roomService: RoomService;
  private userService: UserService;

  constructor() {
    this.bookingService = new BookingService();
		this.roomService = new RoomService();
    this.userService = new UserService();
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

  async createBooking(req: Request & {user?: UserJwtPayload; guestUser?: GuestUserData}, res: Response) {
    try {
      let userPayload: UserJwtPayload;

      // Если есть авторизованный пользователь - используем его
      if (req.user) {
        userPayload = req.user;
      } 
      // Если нет авторизации - создаем/находим пользователя по данным из запроса
      else if (req.guestUser) {
        const guestData = req.guestUser;
        
        // Проверяем, существует ли пользователь с таким email
        const userRepo = new (require('../../users/infrastructure/user.mongo.repository').UserMongoRepository)();
        let user = await userRepo.findByEmail(guestData.clientEmail);

        // Если пользователь не существует - создаем нового
        if (!user) {
          user = await this.userService.createUserByAdmin({
            email: guestData.clientEmail,
            phone: guestData.clientPhone,
            fullName: guestData.clientFio,
          });
        }

        // Формируем userPayload из созданного/найденного пользователя
        userPayload = {
          userId: user._id!.toString(),
          email: user.email,
          phone: user.phone || '',
          fullName: user.fullName,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 86400, // 24 часа
        };
      } 
      else {
        res.status(401).json({ message: 'Требуется авторизация или данные клиента' });
        return;
      }

      const booking: BookingWithUser = { ...req.body, user: userPayload };
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
      const status = /already booked|End time|Минимальное время брони/.test(errorMessage) ? 400 : 500;
      res.status(status).json({ message: errorMessage });
    }
  }

  async adminCreateBooking(req: Request, res: Response) {
    try {
      const { userId, roomId, equipmentIds, equipment, start, end, totalPrice, paymentMethod } = req.body as any;
      const newBooking = await this.bookingService.createBookingForUser(userId, {
        roomId,
        equipmentIds,
        equipment,
        start,
        end,
        totalPrice,
        paymentMethod,
      });
      res.status(201).json(newBooking);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const status = /already booked|User not found|Room not found|Equipment not found|End time|Invalid payment method|Недостаточно единиц/.test(errorMessage) ? 400 : 500;
      res.status(status).json({ message: errorMessage });
    }
  }

  /**
   * Добавление оборудования и/или мейкап-комнат к существующему бронированию
   */
  async addItemsToBooking(req: Request, res: Response) {
    try {
      const { bookingId, equipment, makeupRooms } = req.body;

      if (!bookingId) {
        return res.status(400).json({ message: 'bookingId is required' });
      }

      if ((!equipment || equipment.length === 0) && (!makeupRooms || makeupRooms.length === 0)) {
        return res.status(400).json({ message: 'At least one item (equipment or makeupRoom) must be provided' });
      }

      const result = await this.bookingService.addItemsToBooking(
        bookingId,
        equipment,
        makeupRooms
      );

      // Определяем логику оплаты
      const booking = result.booking;
      const isPaid = booking.isPaid || booking.paymentStatus === 'paid';

      res.status(200).json({
        message: 'Items added successfully',
        booking: result.booking,
        additionalPrice: result.additionalPrice,
        paymentRequired: result.additionalPrice > 0,
        paymentInfo: {
          // Если бронирование уже оплачено - платим только за новые позиции
          // Если не оплачено - платим за всё
          amountToPay: isPaid ? result.additionalPrice : booking.totalPrice,
          description: isPaid 
            ? 'Оплата дополнительного оборудования/гримерных' 
            : 'Оплата бронирования (включая добавленное оборудование/гримерные)',
          isPaidBooking: isPaid
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const status = /not found|cancelled|deleted|Недостаточно|превышать|Минимальное/.test(errorMessage) ? 400 : 500;
      res.status(status).json({ message: errorMessage });
    }
  }
}