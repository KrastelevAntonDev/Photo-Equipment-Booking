import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { Payment } from '../models/Payment';
import { RoomService } from '../services/RoomService';
import { UserJwtPayload } from '../models/User';

export class PaymentController {
	private paymentService: PaymentService;

	constructor() {
		this.paymentService = new PaymentService();
	}

	async getAllPayments(req: Request, res: Response) {
		try {
			const payments = await this.paymentService.getAllPayments();
			res.json(payments);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			res.status(500).json({ message: errorMessage });
		}
	}

	async createPayment(req: Request & { user?: UserJwtPayload }, res: Response) {
		try {
			const payment: Payment = { ...req.body, user: req.user };
			const newPayment = await this.paymentService.createPayment(payment);
			res.status(201).json(newPayment);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			res.status(400).json({ message: errorMessage });
		}
	}

	async getPaymentById(req: Request, res: Response) {
		try {
			const payment = await this.paymentService.getPaymentById(req.params.id);
			if (!payment) {
				return res.status(404).json({ message: 'Payment not found' });
			}
			res.json(payment);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			res.status(500).json({ message: errorMessage });
		}
	}
}