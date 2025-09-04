import { Collection, ObjectId } from 'mongodb';
import { getDB } from '../config/database';
import { Payment } from '../models/Payment';

export class PaymentRepository {
	private collection: Collection<Payment> | null = null;

	private getCollection(): Collection<Payment> {
		if (!this.collection) {
			this.collection = getDB().collection<Payment>('payment');
		}
		return this.collection;
	}

	async findAll(): Promise<Payment[]> {
		return this.getCollection().find().toArray();
	}

	async createPayment(payment: Payment): Promise<Payment> {
		const result = await this.getCollection().insertOne(payment);
		return { ...payment, _id: result.insertedId };
	}

	async findById(id: string): Promise<Payment | null> {
		if (!ObjectId.isValid(id)) {
			 throw new Error('Invalid ID format');
		}
		const _id = new ObjectId(id);
		return this.getCollection().findOne({ _id });
	}

}