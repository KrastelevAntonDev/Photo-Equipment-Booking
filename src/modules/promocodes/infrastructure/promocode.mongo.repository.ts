import { Collection, Db, ObjectId } from 'mongodb';
import { Promocode } from '../domain/promocode.entity';
import { PromocodeRepository } from '../domain/promocode.repository';

export class PromocodeMongoRepository implements PromocodeRepository {
  private collection: Collection<Promocode>;

  constructor(db: Db) {
    this.collection = db.collection<Promocode>('promocodes');
  }

  async create(promocode: Omit<Promocode, '_id'>): Promise<Promocode> {
    const result = await this.collection.insertOne(promocode as Promocode);
    return { ...promocode, _id: result.insertedId } as Promocode;
  }

  async findById(id: ObjectId): Promise<Promocode | null> {
    return this.collection.findOne({ _id: id, isDeleted: { $ne: true } });
  }

  async findByCode(code: string): Promise<Promocode | null> {
    return this.collection.findOne({ 
      code: code.toUpperCase(), 
      isDeleted: { $ne: true } 
    });
  }

  async findAll(skip: number = 0, limit: number = 100): Promise<Promocode[]> {
    return this.collection
      .find({ isDeleted: { $ne: true } })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async update(id: ObjectId, data: Partial<Promocode>): Promise<Promocode | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result;
  }

  async delete(id: ObjectId): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: id },
      { $set: { isDeleted: true, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  async incrementUsage(id: ObjectId): Promise<void> {
    await this.collection.updateOne(
      { _id: id },
      { 
        $inc: { usedCount: 1 },
        $set: { updatedAt: new Date() }
      }
    );
  }
}
