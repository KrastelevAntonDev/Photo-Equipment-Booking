import { Collection, ObjectId } from 'mongodb';
import { getDB } from '@config/database';
import { User } from '../domain/user.entity';
import { IUserRepository } from '../domain/user.repository';
import { normalizePhone } from '@shared/utils/phone.utils';

export class UserMongoRepository implements IUserRepository {
	private collection: Collection<User> | null = null;

	private getCollection(): Collection<User> {
		if (!this.collection) {
			this.collection = getDB().collection<User>('users');
		}
		return this.collection;
	}

	private normalizeUserPhone(user: User | null): User | null {
		if (user && user.phone) {
			user.phone = normalizePhone(user.phone);
		}
		return user;
	}

	async getUser(id: string): Promise<User | null> {
		if (!ObjectId.isValid(id)) {
			return null;
		}
		const _id = new ObjectId(id);
		const user = await this.getCollection().findOne({ _id });
		return this.normalizeUserPhone(user);
	}

	async findAll(): Promise<User[]> {
		const users = await this.getCollection().find().toArray();
		return users.map(user => this.normalizeUserPhone(user)!).filter(Boolean) as User[];
	}

	async createUser(user: User): Promise<{ status: boolean }> {
		const result = await this.getCollection().insertOne(user);
		return { status: result.acknowledged };
	}

	async findByEmail(email: string): Promise<User | null> {
		const user = await this.getCollection().findOne({ email });
		return this.normalizeUserPhone(user);
	}

	async findById(id: string): Promise<User | null> {
		if (!ObjectId.isValid(id)) {
			return null;
		}
		const _id = new ObjectId(id);
		const user = await this.getCollection().findOne({ _id });
		return this.normalizeUserPhone(user);
	}

	async addBookingToUser(userId: string, bookingId: string): Promise<void> {
		if (!ObjectId.isValid(userId)) return;
		const filter = { _id: new ObjectId(userId) };
		await this.getCollection().updateOne(filter, { $push: { bookings: new ObjectId(bookingId) } });
	}

  async addFavoriteRoom(userId: string, roomId: string): Promise<void> {
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(roomId)) return;
    const filter = { _id: new ObjectId(userId) };
    await this.getCollection().updateOne(filter, { $addToSet: { favoriteRoomIds: new ObjectId(roomId) } });
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }
    // Нормализуем телефон перед обновлением, если он передан
    if (data.phone) {
      data.phone = normalizePhone(data.phone);
    }
    const _id = new ObjectId(id);
    const result = await this.getCollection().findOneAndUpdate(
      { _id },
      { $set: data },
      { returnDocument: 'after' }
    );
    return this.normalizeUserPhone(result);
  }
}

export default UserMongoRepository;

