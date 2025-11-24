import { Receipt, ReceiptStatus } from './receipt.entity';
import { ObjectId } from 'mongodb';

export interface IReceiptRepository {
  create(receipt: Receipt): Promise<Receipt>;
  findById(id: ObjectId): Promise<Receipt | null>;
  findByBookingId(bookingId: ObjectId): Promise<Receipt[]>;
  findByAtolUuid(atolUuid: string): Promise<Receipt | null>;
  updateStatus(id: ObjectId, status: ReceiptStatus, fiscalData?: any, error?: string): Promise<void>;
  findAll(filter?: any): Promise<Receipt[]>;
}
