import { User } from './user.entity';

export interface IUserRepository {
	getUser(id: string): Promise<User | null>;
	findAll(): Promise<User[]>;
	createUser(user: User): Promise<{ status: boolean }>;
	findByEmail(email: string): Promise<User | null>;
	findById(id: string): Promise<User | null>;
	addBookingToUser(userId: string, bookingId: string): Promise<void>;
}

export default IUserRepository;

