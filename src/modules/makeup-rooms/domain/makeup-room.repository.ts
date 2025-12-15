import { MakeupRoom } from './makeup-room.entity';

export interface IMakeupRoomRepository {
  findAll(): Promise<MakeupRoom[]>;
  findById(id: string): Promise<MakeupRoom | null>;
  create(makeupRoom: MakeupRoom): Promise<MakeupRoom>;
  update(id: string, makeupRoom: Partial<MakeupRoom>): Promise<MakeupRoom | null>;
  delete(id: string): Promise<boolean>;
  incrementBookedQuantity(id: string, quantity: number): Promise<void>;
  decrementBookedQuantity(id: string, quantity: number): Promise<void>;
}
