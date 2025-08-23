import { SubscribeRepository } from '../repositories/SubscribeRepository';
import { Subscribe } from '../models/Subscribe';

export class SubscribeService {
	private subscribeRepository: SubscribeRepository;

	constructor() {
		this.subscribeRepository = new SubscribeRepository();
	}

	async getAllSubscribes(): Promise<Subscribe[]> {
		return this.subscribeRepository.findAll();
	}

	async createSubscribe(subscribe: Subscribe): Promise<Subscribe> {
		return this.subscribeRepository.createSubscribe(subscribe);
	}

	async getSubscribeById(id: string): Promise<Subscribe | null> {
		return this.subscribeRepository.findById(id);
	}

}