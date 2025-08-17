import { Collection, ObjectId } from 'mongodb';
import { getDB } from '../config/database';
import { Room } from '../models/Room';

export class RoomRepository {
  private collection: Collection<Room> | null = null;

  private getCollection(): Collection<Room> {
    if (!this.collection) {
      this.collection = getDB().collection<Room>('rooms');
    }
    return this.collection;
  }

  async findAll(): Promise<Room[]> {
    return this.getCollection().find().toArray();
  }

  async createRoom(room: Room): Promise<Room> {
    const result = await this.getCollection().insertOne(room);
    return { ...room, _id: result.insertedId };
  }

	async findById(id: string): Promise<Room | null> {
		if (!ObjectId.isValid(id)) {
			return null;
		}
		const _id = new ObjectId(id);
		return this.getCollection().findOne({ _id });
	}
}