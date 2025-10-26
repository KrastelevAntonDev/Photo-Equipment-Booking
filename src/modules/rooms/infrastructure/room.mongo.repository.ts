import { Collection, ObjectId } from 'mongodb';
import { getDB } from '@config/database';
import { Room } from '../domain/room.entity';
import { IRoomRepository } from '../domain/room.repository';

export class RoomMongoRepository implements IRoomRepository {
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
	async findByName(name: string): Promise<Room | null> {
		return this.getCollection().findOne({ name });
	}
}

export default RoomMongoRepository;

