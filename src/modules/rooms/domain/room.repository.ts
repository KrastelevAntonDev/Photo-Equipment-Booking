import { Room } from './room.entity';

export interface IRoomRepository {
	findAll(): Promise<Room[]>;
	createRoom(room: Room): Promise<Room>;
	findById(id: string): Promise<Room | null>;
}

export default IRoomRepository;

