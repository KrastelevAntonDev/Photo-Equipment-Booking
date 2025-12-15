import { IMakeupRoomRepository } from '../domain/makeup-room.repository';
import { MakeupRoomMongoRepository } from '../infrastructure/makeup-room.mongo.repository';
import { MakeupRoom } from '../domain/makeup-room.entity';

export class MakeupRoomService {
  private repository: IMakeupRoomRepository;

  constructor() {
    this.repository = new MakeupRoomMongoRepository();
  }

  async getAllMakeupRooms(): Promise<MakeupRoom[]> {
    return this.repository.findAll();
  }

  async getMakeupRoomById(id: string): Promise<MakeupRoom | null> {
    return this.repository.findById(id);
  }

  async createMakeupRoom(makeupRoom: MakeupRoom): Promise<MakeupRoom> {
    return this.repository.create(makeupRoom);
  }

  async updateMakeupRoom(id: string, makeupRoom: Partial<MakeupRoom>): Promise<MakeupRoom | null> {
    return this.repository.update(id, makeupRoom);
  }

  async deleteMakeupRoom(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }

  async getAvailableQuantity(id: string): Promise<number> {
    const makeupRoom = await this.repository.findById(id);
    if (!makeupRoom) return 0;
    return (makeupRoom.totalQuantity || 0) - (makeupRoom.bookedQuantity || 0);
  }
}
