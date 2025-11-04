import { Collection, ObjectId } from 'mongodb';
import { getDB } from '@config/database';
import { Booking } from '../domain/booking.entity';
import { IBookingRepository } from '../domain/booking.repository';

export class BookingMongoRepository implements IBookingRepository {
	private collection: Collection<Booking> | null = null;

	private getCollection(): Collection<Booking> {
		if (!this.collection) {
			this.collection = getDB().collection<Booking>('bookings');
		}
		return this.collection;
	}

	async findAll(): Promise<Booking[]> {
		return this.getCollection().find().toArray();
	}

	async updateStatus(
		id: string,
		status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
	): Promise<Booking | null> {
		if (!ObjectId.isValid(id)) {
			return null;
		}
		const _id = new ObjectId(id);
		return await this.getCollection().findOneAndUpdate(
			{ _id },
			{ $set: { status, updatedAt: new Date() } },
			{ returnDocument: 'after' }
		);
	}

	async createBooking(booking: Booking): Promise<Booking> {
		const result = await this.getCollection().insertOne(booking);
		return { ...booking, _id: result.insertedId };
	}

	async findById(id: string): Promise<Booking | null> {
		if (!ObjectId.isValid(id)) {
			return null;
		}
		const _id = new ObjectId(id);
		return this.getCollection().findOne({ _id });
	}

	async findByIdRoom(id: string): Promise<Booking | null> {
		if (!ObjectId.isValid(id)) {
			return null;
		}
		const _id = new ObjectId(id);
		return this.getCollection().findOne({ roomId: _id });
	}

	async findByUserId(userId: string): Promise<Booking[]> {
		if (!ObjectId.isValid(userId)) {
			return [];
		}
		const _userId = new ObjectId(userId);
		return this.getCollection().find({ userId: _userId }).sort({ start: -1 }).toArray();
	}

	async findOverlap(roomId: string, start: any, end: any): Promise<Booking[]> {
		return this.getCollection()
			.find({
				roomId: new ObjectId(roomId),
				$or: [{ start: { $lt: new Date(end) }, end: { $gt: new Date(start) } }],
				status: { $in: ['pending', 'confirmed'] },
			})
			.toArray();
	}

	async findBusySlots(roomId: string, rangeStart: any, rangeEnd: any): Promise<Booking[]> {
		const bookings = await this.getCollection()
			.find({
				roomId: new ObjectId(roomId),
				status: { $in: ['pending', 'confirmed'] },
				$or: [{ start: { $lt: new Date(rangeEnd) }, end: { $gt: new Date(rangeStart) } }],
			})
			.toArray();

		return bookings;
	}

	async updatePaymentInfo(
		id: string,
		payload: { paymentMethod?: 'online' | 'on_site_cash' | 'on_site_card'; isPaid?: boolean; paidAmount?: number; paymentStatus?: 'unpaid' | 'partial' | 'paid' }
	): Promise<Booking | null> {
		if (!ObjectId.isValid(id)) {
			return null;
		}
		const _id = new ObjectId(id);
		const update: Partial<Booking> = {
			...('paymentMethod' in payload ? { paymentMethod: payload.paymentMethod } : {}),
			...('isPaid' in payload ? { isPaid: payload.isPaid } : {}),
			...('paidAmount' in payload ? { paidAmount: payload.paidAmount } : {}),
			...('paymentStatus' in payload ? { paymentStatus: payload.paymentStatus } : {}),
			updatedAt: new Date(),
		};
		return this.getCollection().findOneAndUpdate(
			{ _id },
			{ $set: update },
			{ returnDocument: 'after' }
		);
	}

		async updatePartial(
			id: string,
			update: Partial<Pick<Booking, 'roomId' | 'equipmentIds' | 'start' | 'end' | 'status' | 'totalPrice' | 'paymentMethod' | 'isPaid' | 'paidAmount' | 'paymentStatus'>>
		): Promise<Booking | null> {
			if (!ObjectId.isValid(id)) {
				return null;
			}
			const _id = new ObjectId(id);
			// Приведение типов для ObjectId и Date
			const set: any = { updatedAt: new Date() };
			if (update.roomId) set.roomId = new ObjectId(update.roomId);
			if (update.equipmentIds) set.equipmentIds = update.equipmentIds.map((e: any) => new ObjectId(e));
			if (update.start) set.start = new Date(update.start);
			if (update.end) set.end = new Date(update.end);
			if (typeof update.totalPrice !== 'undefined') set.totalPrice = update.totalPrice;
			if (update.status) set.status = update.status;
			if (typeof update.isPaid !== 'undefined') set.isPaid = update.isPaid;
			if (typeof update.paidAmount !== 'undefined') set.paidAmount = update.paidAmount;
			if (typeof update.paymentStatus !== 'undefined') set.paymentStatus = update.paymentStatus;
			if (update.paymentMethod) set.paymentMethod = update.paymentMethod;

			return this.getCollection().findOneAndUpdate(
				{ _id },
				{ $set: set },
				{ returnDocument: 'after' }
			);
		}
}

export default BookingMongoRepository;

