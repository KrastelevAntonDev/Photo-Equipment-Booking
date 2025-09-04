import { Collection, ObjectId } from 'mongodb';
import { getDB } from '../config/database';
import { Booking } from '../models/Booking';

export class BookingRepository {
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
		console.log(_id);
		
    return this.getCollection().findOne({ roomId: _id });
  }

  async findOverlap(roomId: string, start: Date, end: Date): Promise<Booking[]> {
    return this.getCollection().find({
      roomId: new ObjectId(roomId),
      $or: [
        { start: { $lt: end }, end: { $gt: start } }, // Пересечение
      ],
      status: { $in: ['pending', 'confirmed'] }
    }).toArray();
  }
}