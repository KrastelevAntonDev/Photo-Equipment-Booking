import { ISubscriptionRepository } from '../domain/subscription.repository';
import { SubscriptionMongoRepository } from '../infrastructure/subscription.mongo.repository';
import { Subscribe } from '../domain/subscription.entity';

export class SubscribeService {
	private subscribeRepository: ISubscriptionRepository;

	constructor() {
		this.subscribeRepository = new SubscriptionMongoRepository();
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