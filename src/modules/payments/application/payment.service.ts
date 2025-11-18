import { Payment } from '../domain/payment.entity';
import { IPaymentRepository } from '../domain/payment.repository';
import { PaymentMongoRepository } from '../infrastructure/payment.mongo.repository';
import { createPaymentProvider } from '../infrastructure/provider.factory';
import { ReceiptResponse } from '@infrastructure/external/yookassa/yookassa.types';

export class PaymentService {
	private paymentRepository: IPaymentRepository;
	private paymentProvider;

	constructor() {
		this.paymentRepository = new PaymentMongoRepository();
		this.paymentProvider = createPaymentProvider();
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

	async getReceipt(receiptId: string): Promise<ReceiptResponse> {
		return this.paymentProvider.getReceipt(receiptId) as Promise<ReceiptResponse>;
	}
}