import { Payment } from './payment.entity';

export interface IPaymentRepository {
	findAll(): Promise<Payment[]>;
	createPayment(payment: Payment): Promise<Payment>;
	findById(id: string): Promise<Payment | null>;
}

export default IPaymentRepository;
