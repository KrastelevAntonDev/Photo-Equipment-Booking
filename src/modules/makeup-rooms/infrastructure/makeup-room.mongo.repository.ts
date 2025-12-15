import { Collection, ObjectId } from 'mongodb';
import { getDB } from '@/config/database';
import { IMakeupRoomRepository } from '../domain/makeup-room.repository';
import { MakeupRoom } from '../domain/makeup-room.entity';

export class MakeupRoomMongoRepository implements IMakeupRoomRepository {
  private collection: Collection<MakeupRoom>;

  constructor() {
    const db = getDB();
    this.collection = db.collection<MakeupRoom>('makeuprooms');
  }

  async findAll(): Promise<MakeupRoom[]> {
    return this.collection.find({ isDeleted: { $ne: true }, isAvailable: true }).toArray();
  }

  async findById(id: string): Promise<MakeupRoom | null> {
    return this.collection.findOne({ _id: new ObjectId(id), isDeleted: { $ne: true } });
  }

  async create(makeupRoom: MakeupRoom): Promise<MakeupRoom> {
    const result = await this.collection.insertOne({
      ...makeupRoom,
      bookedQuantity: 0,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    } as MakeupRoom);
    
    return { ...makeupRoom, _id: result.insertedId };
  }

  async update(id: string, makeupRoom: Partial<MakeupRoom>): Promise<MakeupRoom | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...makeupRoom, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isDeleted: true, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  async incrementBookedQuantity(id: string, quantity: number): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { bookedQuantity: quantity }, $set: { updatedAt: new Date() } }
    );
  }

  async decrementBookedQuantity(id: string, quantity: number): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { bookedQuantity: -quantity }, $set: { updatedAt: new Date() } }
    );
  }
}
