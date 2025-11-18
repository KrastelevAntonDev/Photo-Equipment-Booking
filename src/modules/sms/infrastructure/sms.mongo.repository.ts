import { Collection } from 'mongodb';
import { getDB } from '@config/database';
import { ISmsRepository, SmsMessage } from '../domain/sms.entity';

export class SmsMongoRepository implements ISmsRepository {
  private collection: Collection<SmsMessage> | null = null;

  private getCollection(): Collection<SmsMessage> {
    if (!this.collection) this.collection = getDB().collection<SmsMessage>('sms_messages');
    return this.collection;
  }

  async insertMessage(doc: SmsMessage): Promise<SmsMessage> {
    const now = new Date();
    const toInsert: SmsMessage = { ...doc, createdAt: now, updatedAt: now };
    const result = await this.getCollection().insertOne(toInsert);
    return { ...toInsert, _id: result.insertedId };
  }

  async updateByProviderId(providerSmsId: number, patch: Partial<SmsMessage>): Promise<void> {
    await this.getCollection().updateOne({ providerSmsId }, { $set: { ...patch, updatedAt: new Date() } });
  }

  async findByProviderId(providerSmsId: number): Promise<SmsMessage | null> {
    return this.getCollection().findOne({ providerSmsId });
  }
}

export default SmsMongoRepository;
