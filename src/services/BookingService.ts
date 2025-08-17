import { BookingRepository } from '../repositories/BookingRepository';
import { Booking } from '../models/Booking';
import { UserRepository } from '../repositories/UserRepository';
import { RoomRepository } from '../repositories/RoomRepository';
import { EquipmentRepository } from '../repositories/EquipmentRepository';
import { ObjectId } from 'mongodb';

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

  async createBooking(booking: Booking): Promise<Booking> {
    // Проверка пользователя
    const user = await this.userRepository.findById(booking.userId.toString());
    if (!user) throw new Error('User not found');

    // Проверка зала
    const room = await this.roomRepository.findById(booking.roomId.toString());
    if (!room) throw new Error('Room not found');

    // Проверка оборудования
    if (booking.equipmentIds && booking.equipmentIds.length) {
      for (const eqId of booking.equipmentIds) {
        const eq = await this.equipmentRepository.findById(eqId.toString());
        if (!eq) throw new Error(`Equipment not found: ${eqId}`);
      }
    }

    // Проверка пересечения времени бронирования для зала
    const overlap = await this.bookingRepository.findOverlap(booking.roomId.toString(), booking.start, booking.end);
    if (overlap.length > 0) throw new Error('Room already booked for this time');

    // Создаем бронирование
    const equipmentIds = booking.equipmentIds ? booking.equipmentIds.map(id => new ObjectId(id)) : [];
		const newBody = { ...booking, status: 'pending', roomId: new ObjectId(booking.roomId), userId: new ObjectId(booking.userId), equipmentIds } as Booking;
    const newBooking = await this.bookingRepository.createBooking(newBody);

    // Интеграция с пользователем — добавляем bookingId в user.bookings
    await this.userRepository.addBookingToUser(booking.userId.toString(), newBooking._id!.toString());

    return newBooking;
  }

  async getBookingById(id: string): Promise<Booking | null> {
    return this.bookingRepository.findById(id);
  }
	async getBookingByIdRoom(id: string): Promise<Booking | null> {
    return this.bookingRepository.findByIdRoom(id);
  }
}