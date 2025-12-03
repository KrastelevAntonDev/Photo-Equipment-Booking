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
		// Публичный API: показываем только доступные залы (isAvailable: true, isDeleted: false)
		return this.getCollection().find<Room>({ 
			isDeleted: { $ne: true },
			isAvailable: true 
		}).toArray();
	}

	async findAllIncludingDeleted(): Promise<Room[]> {
		// Админка: показываем все залы (включая недоступные и удалённые)
		return this.getCollection().find<Room>({}).toArray();
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

	async updateRoom(id: string, data: Partial<Room>): Promise<Room | null> {
		if (!ObjectId.isValid(id)) {
			return null;
		}
		const _id = new ObjectId(id);
		const update = { ...data, updatedAt: new Date() };
		delete update._id;
		const collection = this.getCollection();
		await collection.updateOne({ _id }, { $set: update });
		return collection.findOne({ _id });
	}

	async softDelete(id: string): Promise<boolean> {
		if (!ObjectId.isValid(id)) return false;
		const result = await this.getCollection().updateOne(
			{ _id: new ObjectId(id) },
			{ $set: { isDeleted: true, updatedAt: new Date() } }
		);
		return result.modifiedCount > 0;
	}
}

export default RoomMongoRepository;

