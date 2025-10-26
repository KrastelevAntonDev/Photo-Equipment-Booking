import { Booking } from './booking.entity';

export interface IBookingRepository {
	findAll(): Promise<Booking[]>;
	updateStatus(
		id: string,
		status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
	): Promise<Booking | null>;
	createBooking(booking: Booking): Promise<Booking>;
	findById(id: string): Promise<Booking | null>;
	findByIdRoom(id: string): Promise<Booking | null>;
	findOverlap(roomId: string, start: any, end: any): Promise<Booking[]>;
	findBusySlots(roomId: string, rangeStart: any, rangeEnd: any): Promise<Booking[]>;
  updatePaymentInfo(
    id: string,
    payload: { paymentMethod?: 'online' | 'on_site_cash' | 'on_site_card'; isPaid?: boolean }
  ): Promise<Booking | null>;
}

export default IBookingRepository;

