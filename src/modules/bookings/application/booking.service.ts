import { IBookingRepository } from '../domain/booking.repository';
import { BookingMongoRepository } from '../infrastructure/booking.mongo.repository';
import { Booking, BookingWithUser, BusySlot } from '../domain/booking.entity';
import { IUserRepository } from '@modules/users/domain/user.repository';
import { UserMongoRepository } from '@modules/users/infrastructure/user.mongo.repository';
import { IRoomRepository } from '@modules/rooms/domain/room.repository';
import { RoomMongoRepository } from '@modules/rooms/infrastructure/room.mongo.repository';
import { IEquipmentRepository } from '@modules/equipment/domain/equipment.repository';
import { EquipmentMongoRepository } from '@modules/equipment/infrastructure/equipment.mongo.repository';
import { ObjectId } from 'mongodb';

export class BookingService {
  private bookingRepository: IBookingRepository;
  private userRepository: IUserRepository;
  private roomRepository: IRoomRepository;
  private equipmentRepository: IEquipmentRepository;

  constructor() {
    this.bookingRepository = new BookingMongoRepository();
  this.userRepository = new UserMongoRepository();
  this.roomRepository = new RoomMongoRepository();
  this.equipmentRepository = new EquipmentMongoRepository();
  }

  async getAllBookings(): Promise<Booking[]> {
    return this.bookingRepository.findAll();
  }
  async updateBookingStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed'): Promise<Booking | null> {
    return this.bookingRepository.updateStatus(id, status);
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
    
    // Проверка пересечения времени бронирования для зала
    const overlap = await this.bookingRepository.findOverlap(booking.roomId.toString(), booking.start, booking.end);
    if (overlap.length > 0) throw new Error('Room already booked for this time');
    console.log(overlap);
    
    // Создаем бронирование
    const equipmentIds = booking.equipmentIds ? booking.equipmentIds.map(id => new ObjectId(id)) : [];
		const newBody = { ...booking, status: 'pending', roomId: new ObjectId(booking.roomId), userId: new ObjectId(userId), equipmentIds, createdAt: new Date(), updatedAt: new Date(), start: new Date(booking.start), end: new Date(booking.end) } as Booking;
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
  async getBusySlots(roomId: string, rangeStart: Date, rangeEnd: Date): Promise<BusySlot[]> {
  const bookings = await this.bookingRepository.findBusySlots(roomId, rangeStart, rangeEnd);
  return bookings.map(b => ({
      roomId: b.roomId.toString(),
      start: b.start,
      end: b.end,
      status: b.status as 'pending' | 'confirmed'
    }));
  }
}