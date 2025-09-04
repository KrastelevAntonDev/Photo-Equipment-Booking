import { PaymentRepository } from '../repositories/payment.repositories';
import { Payment } from '../models/Payment';

export class PaymentService {
	private paymentRepository: PaymentRepository;

	constructor() {
		this.paymentRepository = new PaymentRepository();
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