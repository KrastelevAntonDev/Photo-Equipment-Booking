import { Subscribe } from './subscription.entity';

export interface ISubscriptionRepository {
	findAll(): Promise<Subscribe[]>;
	createSubscribe(subscribe: Subscribe): Promise<Subscribe>;
	findById(id: string): Promise<Subscribe | null>;
}

export default ISubscriptionRepository;

