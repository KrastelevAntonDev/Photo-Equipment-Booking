import { IReceiptRepository } from '../domain/receipt.repository';
import { Receipt, ReceiptStatus } from '../domain/receipt.entity';
import { ObjectId } from 'mongodb';
import { getDB } from '../../../config/database';

export class ReceiptMongoRepository implements IReceiptRepository {
  private getCollection() {
    return getDB().collection<Receipt>('receipts');
  }

  async create(receipt: Receipt): Promise<Receipt> {
    const result = await this.getCollection().insertOne(receipt as any);
    receipt._id = result.insertedId;
    return receipt;
  }

  async findById(id: ObjectId): Promise<Receipt | null> {
    const doc = await this.getCollection().findOne({ _id: id });
    return doc ? new Receipt(doc) : null;
  }

  async findByBookingId(bookingId: ObjectId): Promise<Receipt[]> {
    const docs = await this.getCollection()
      .find({ bookingId })
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map(doc => new Receipt(doc));
  }

  async findByAtolUuid(atolUuid: string): Promise<Receipt | null> {
    const doc = await this.getCollection().findOne({ atolUuid });
    return doc ? new Receipt(doc) : null;
  }

  async updateStatus(
    id: ObjectId, 
    status: ReceiptStatus, 
    fiscalData?: any, 
    error?: string
  ): Promise<void> {
    const update: any = {
      status,
      updatedAt: new Date()
    };

    if (fiscalData) {
      update.fiscalData = fiscalData;
    }

    if (error) {
      update.error = error;
    }

    await this.getCollection().updateOne(
      { _id: id },
      { $set: update }
    );
  }

  async findAll(filter: any = {}): Promise<Receipt[]> {
    const docs = await this.getCollection()
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map(doc => new Receipt(doc));
  }
}
