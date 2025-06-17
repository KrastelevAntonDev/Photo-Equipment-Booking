import { Collection } from 'mongodb';
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

  async findAll(): Promise<User[]> {
    return this.getCollection().find().toArray();
  }
    async createUser(user: User): Promise<User> {
    const result = await this.getCollection().insertOne(user);
    return { ...user, _id: result.insertedId };
  }
}