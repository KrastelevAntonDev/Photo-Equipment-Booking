import { Room } from './room.entity';

export interface IRoomRepository {
	findAll(): Promise<Room[]>;
	findAllIncludingDeleted(): Promise<Room[]>;
	createRoom(room: Room): Promise<Room>;
	findById(id: string): Promise<Room | null>;
	findByName(name: string): Promise<Room | null>;
	updateRoom(id: string, data: Partial<Room>): Promise<Room | null>;
  softDelete(id: string): Promise<boolean>;
}

export default IRoomRepository;

