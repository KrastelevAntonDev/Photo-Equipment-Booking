import { Request, Response } from 'express';
import { SubscribeService } from '../application/subscription.service';
import { Subscribe } from '../domain/subscription.entity';

export class SubscribeController {
	private subscribeService: SubscribeService;

	constructor() {
		this.subscribeService = new SubscribeService();
	}

	async getAllSubscribes(req: Request, res: Response) {
		try {
			const subscribes = await this.subscribeService.getAllSubscribes();
			res.json(subscribes);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			res.status(500).json({ message: errorMessage });
		}
	}

	async createSubscribe(req: Request, res: Response) {
		try {
			const subscribe: Subscribe = req.body;
			const newSubscribe = await this.subscribeService.createSubscribe(subscribe);
			res.status(201).json(newSubscribe);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			res.status(500).json({ message: errorMessage });
		}
	}

	async getSubscribeById(req: Request, res: Response) {
		try {
			const subscribe = await this.subscribeService.getSubscribeById(req.params.id);
			if (!subscribe) {
				return res.status(404).json({ message: 'Subscribe not found' });
			}
			res.json(subscribe);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			res.status(500).json({ message: errorMessage });
		}
	}
}