import { Collection, ObjectId } from 'mongodb';
import { getDB } from '../../../config/database';
import { Subscribe } from '../domain/subscription.entity';
import { ISubscriptionRepository } from '../domain/subscription.repository';

export class SubscriptionMongoRepository implements ISubscriptionRepository {
	private collection: Collection<Subscribe> | null = null;

	private getCollection(): Collection<Subscribe> {
		if (!this.collection) {
			this.collection = getDB().collection<Subscribe>('subscribes');
		}
		return this.collection;
	}

	async findAll(): Promise<Subscribe[]> {
		return this.getCollection().find().toArray();
	}

	async createSubscribe(subscribe: Subscribe): Promise<Subscribe> {
		const result = await this.getCollection().insertOne(subscribe);
		return { ...subscribe, _id: result.insertedId };
	}

	async findById(id: string): Promise<Subscribe | null> {
		if (!ObjectId.isValid(id)) {
			return null;
		}
		const _id = new ObjectId(id);
		return this.getCollection().findOne({ _id });
	}
}

export default SubscriptionMongoRepository;

