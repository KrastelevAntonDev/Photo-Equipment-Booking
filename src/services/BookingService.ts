import { BookingRepository } from '../repositories/BookingRepository';
import { Booking, BookingWithUser } from '../models/Booking';
import { UserRepository } from '../repositories/UserRepository';
import { RoomRepository } from '../repositories/RoomRepository';
import { EquipmentRepository } from '../repositories/EquipmentRepository';
import { ObjectId } from 'mongodb';
import { UserJwtPayload } from '../models/User';

export class BookingService {
  private bookingRepository: BookingRepository;
  private userRepository: UserRepository;
  private roomRepository: RoomRepository;
  private equipmentRepository: EquipmentRepository;

  constructor() {
    this.bookingRepository = new BookingRepository();
    this.userRepository = new UserRepository();
    this.roomRepository = new RoomRepository();
    this.equipmentRepository = new EquipmentRepository();
  }

  async getAllBookings(): Promise<Booking[]> {
    return this.bookingRepository.findAll();
  }

  async createBooking(booking: BookingWithUser): Promise<Booking> {
    // Проверка пользователя
    const userId = booking.user.userId;
    const user = await this.userRepository.findById(userId.toString());
    if (!user) throw new Error('User not found');
    console.log(user);
    
    // Проверка зала
    const room = await this.roomRepository.findById(booking.roomId.toString());
    if (!room) throw new Error('Room not found');
    console.log(room);
    
    // Проверка оборудования
    if (booking.equipmentIds && booking.equipmentIds.length) {
      for (const eqId of booking.equipmentIds) {
        const eq = await this.equipmentRepository.findById(eqId.toString());
        if (!eq) throw new Error(`Equipment not found: ${eqId}`);
      }
    }
    console.log(booking.equipmentIds);
    
    // Проверка пересечения времени бронирования для зала
    const overlap = await this.bookingRepository.findOverlap(booking.roomId.toString(), booking.start, booking.end);
    if (overlap.length > 0) throw new Error('Room already booked for this time');
    console.log(overlap);
    
    // Создаем бронирование
    const equipmentIds = booking.equipmentIds ? booking.equipmentIds.map(id => new ObjectId(id)) : [];
		const newBody = { ...booking, status: 'pending', roomId: new ObjectId(booking.roomId), userId: new ObjectId(booking.userId), equipmentIds } as Booking;
    const newBooking = await this.bookingRepository.createBooking(newBody);

    // Интеграция с пользователем — добавляем bookingId в user.bookings
    await this.userRepository.addBookingToUser(userId.toString(), newBooking._id!.toString());

    return newBooking;
  }

  async getBookingById(id: string): Promise<Booking | null> {
    return this.bookingRepository.findById(id);
  }
	async getBookingByIdRoom(id: string): Promise<Booking | null> {
    return this.bookingRepository.findByIdRoom(id);
  }
}