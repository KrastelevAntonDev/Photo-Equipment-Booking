import { Collection, ObjectId } from 'mongodb';
import { getDB } from '@config/database';
import { Payment } from '../domain/payment.entity';
import { IPaymentRepository } from '../domain/payment.repository';

export class PaymentMongoRepository implements IPaymentRepository {
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
		const now = new Date();
		const toInsert: Payment = {
			...payment,
			createdAt: payment.createdAt ?? now,
			updatedAt: now,
		};
		const result = await this.getCollection().insertOne(toInsert);
		return { ...toInsert, _id: result.insertedId };
	}

	async findById(id: string): Promise<Payment | null> {
		if (!ObjectId.isValid(id)) {
			throw new Error('Invalid ID format');
		}
		const _id = new ObjectId(id);
		return this.getCollection().findOne({ _id });
	}
}

export default PaymentMongoRepository;
