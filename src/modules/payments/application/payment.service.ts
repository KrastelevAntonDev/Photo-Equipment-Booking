import { Payment } from '../domain/payment.entity';
import { IPaymentRepository } from '../domain/payment.repository';
import { PaymentMongoRepository } from '../infrastructure/payment.mongo.repository';

export class PaymentService {
	private paymentRepository: IPaymentRepository;

	constructor() {
		this.paymentRepository = new PaymentMongoRepository();
	}

	async getAllPayments(): Promise<Payment[]> {
		return this.paymentRepository.findAll();
	}

	async createPayment(payment: Payment): Promise<Payment> {
		return this.paymentRepository.createPayment(payment);
	}

	async getPaymentById(id: string): Promise<Payment | null> {
		return this.paymentRepository.findById(id);
	}
}