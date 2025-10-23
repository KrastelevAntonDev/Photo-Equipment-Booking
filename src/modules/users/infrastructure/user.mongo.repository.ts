import { Collection, ObjectId } from 'mongodb';
import { getDB } from '@config/database';
import { User } from '../domain/user.entity';
import { IUserRepository } from '../domain/user.repository';

export class UserMongoRepository implements IUserRepository {
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

	async createUser(user: User): Promise<{ status: boolean }> {
		const result = await this.getCollection().insertOne(user);
		return { status: result.acknowledged };
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
		const filter = { _id: new ObjectId(userId) };
		await this.getCollection().updateOne(filter, { $push: { bookings: new ObjectId(bookingId) } });
	}
}

export default UserMongoRepository;

