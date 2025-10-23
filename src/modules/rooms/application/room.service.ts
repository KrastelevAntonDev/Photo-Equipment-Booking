import { IRoomRepository } from '../domain/room.repository';
import { RoomMongoRepository } from '../infrastructure/room.mongo.repository';
import { Room } from '../domain/room.entity';

export class RoomService {
  private roomRepository: IRoomRepository;

  constructor() {
    this.roomRepository = new RoomMongoRepository();
  }

  async getAllRooms(): Promise<Room[]> {
    return this.roomRepository.findAll();
  }

  async createRoom(room: Room): Promise<Room> {
    return this.roomRepository.createRoom(room);
  }

  async getRoomById(id: string): Promise<Room | null> {
    return this.roomRepository.findById(id);
  }
}