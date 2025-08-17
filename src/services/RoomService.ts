import { RoomRepository } from '../repositories/RoomRepository';
import { Room } from '../models/Room';

export class RoomService {
  private roomRepository: RoomRepository;

  constructor() {
    this.roomRepository = new RoomRepository();
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