import { Collection, ObjectId } from 'mongodb';
import { getDB } from '../config/database';
import { User } from '../models/User';

export class UserRepository {
  private collection: Collection<User> | null = null;

  private getCollection(): Collection<User> {
    if (!this.collection) {
      this.collection = getDB().collection<User>('users');
    }
    return this.collection;
  }
  async getUser(id: string): Promise<User | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }
    const _id = new ObjectId(id);
    return this.getCollection().findOne({ _id });
  }
  
  async findAll(): Promise<User[]> {
    return this.getCollection().find().toArray();
  }

  async createUser(user: Omit<User, '_id'>): Promise<User> {
    const now = new Date();
    const doc = {
      ...user,
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.getCollection().insertOne(doc as any);
    return { ...(doc as any), _id: result.insertedId };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.getCollection().findOne({ email });
  }

  async findById(id: string): Promise<User | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }
    const _id = new ObjectId(id);
    return this.getCollection().findOne({ _id });
  }

  async addBookingToUser(userId: string, bookingId: string): Promise<void> {
    if (!ObjectId.isValid(userId)) return;
    // Если bookingId тоже ObjectId в схеме, конвертируй:
    const filter = { _id: new ObjectId(userId) };
    await this.getCollection().updateOne(
      filter,
      { $push: { bookings: new ObjectId(bookingId) } } // или new ObjectId(bookingId)
    );
  }
}