import { ObjectId } from 'mongodb';
import { Promocode } from './promocode.entity';

export interface PromocodeRepository {
  create(promocode: Omit<Promocode, '_id'>): Promise<Promocode>;
  findById(id: ObjectId): Promise<Promocode | null>;
  findByCode(code: string): Promise<Promocode | null>;
  findAll(skip?: number, limit?: number): Promise<Promocode[]>;
  update(id: ObjectId, data: Partial<Promocode>): Promise<Promocode | null>;
  delete(id: ObjectId): Promise<boolean>;
  incrementUsage(id: ObjectId): Promise<void>;
}
