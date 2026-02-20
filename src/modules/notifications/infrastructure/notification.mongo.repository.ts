import { Collection, Db, ObjectId } from 'mongodb';
import {
  NotificationEntity,
  NotificationStatus,
  NotificationType,
} from '../domain/notification.entity';
import { NotificationRepository } from '../domain/notification.repository';

export class NotificationMongoRepository implements NotificationRepository {
  private collection: Collection<NotificationEntity> | null = null;

  constructor(private db: Db | null = null) {}

  private getCollection(): Collection<NotificationEntity> {
    if (!this.collection) {
      if (!this.db) {
        throw new Error('Database not initialized in NotificationMongoRepository');
      }
      this.collection = this.db.collection<NotificationEntity>('notifications');
    }
    return this.collection;
  }

  async create(notification: NotificationEntity): Promise<NotificationEntity> {
    const collection = this.getCollection();
    const now = new Date();
    
    const doc: NotificationEntity = {
      ...notification,
      _id: notification._id || new ObjectId(),
      status: notification.status || NotificationStatus.PENDING,
      attempts: 0,
      maxAttempts: notification.maxAttempts || 3,
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(doc);
    return doc;
  }

  async findById(id: ObjectId): Promise<NotificationEntity | null> {
    const collection = this.getCollection();
    return collection.findOne({ _id: id });
  }

  async findByBookingId(bookingId: ObjectId): Promise<NotificationEntity[]> {
    const collection = this.getCollection();
    return collection.find({ bookingId }).sort({ createdAt: -1 }).toArray();
  }

  async findByStatus(status: NotificationStatus): Promise<NotificationEntity[]> {
    const collection = this.getCollection();
    return collection.find({ status }).sort({ scheduledFor: 1 }).toArray();
  }

  async findReadyToSend(now: Date): Promise<NotificationEntity[]> {
    const collection = this.getCollection();
    return collection
      .find({
        status: NotificationStatus.SCHEDULED,
        scheduledFor: { $lte: now },
        attempts: { $lt: 3 }, // Не превышен лимит попыток
      })
      .sort({ priority: -1, scheduledFor: 1 })
      .toArray();
  }

  async exists(bookingId: ObjectId, type: NotificationType): Promise<boolean> {
    const collection = this.getCollection();
    const count = await collection.countDocuments({
      bookingId,
      type,
      status: { $nin: [NotificationStatus.CANCELLED, NotificationStatus.FAILED] },
    });
    return count > 0;
  }

  async updateStatus(
    id: ObjectId,
    status: NotificationStatus,
    data?: {
      sentAt?: Date;
      lastError?: string;
      attempts?: number;
      jobId?: string;
      cancelReason?: string;
    }
  ): Promise<void> {
    const collection = this.getCollection();
    const updateFields: any = {
      status,
      updatedAt: new Date(),
    };

    if (data?.sentAt) updateFields.sentAt = data.sentAt;
    if (data?.lastError) updateFields.lastError = data.lastError;
    if (data?.attempts !== undefined) updateFields.attempts = data.attempts;
    if (data?.jobId) updateFields.jobId = data.jobId;
    if (data?.cancelReason) updateFields.cancelReason = data.cancelReason;

    await collection.updateOne({ _id: id }, { $set: updateFields });
  }

  async markAsSent(id: ObjectId, sentAt: Date, smsId?: string): Promise<void> {
    const collection = this.getCollection();
    const updateFields: any = {
      status: NotificationStatus.SENT,
      sentAt,
      updatedAt: new Date(),
    };

    if (smsId) {
      updateFields['metadata.smsId'] = smsId;
    }

    await collection.updateOne({ _id: id }, { $set: updateFields });
  }

  async markAsFailed(id: ObjectId, error: string, attempts: number): Promise<void> {
    const collection = this.getCollection();
    await collection.updateOne(
      { _id: id },
      {
        $set: {
          status: NotificationStatus.FAILED,
          lastError: error,
          attempts,
          updatedAt: new Date(),
        },
      }
    );
  }

  async cancelByBookingId(bookingId: ObjectId): Promise<number> {
    const collection = this.getCollection();
    const result = await collection.updateMany(
      {
        bookingId,
        status: { $in: [NotificationStatus.PENDING, NotificationStatus.SCHEDULED] },
      },
      {
        $set: {
          status: NotificationStatus.CANCELLED,
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount;
  }

  async deleteOlderThan(date: Date): Promise<number> {
    const collection = this.getCollection();
    const result = await collection.deleteMany({
      createdAt: { $lt: date },
      status: { $in: [NotificationStatus.SENT, NotificationStatus.FAILED, NotificationStatus.CANCELLED] },
    });
    return result.deletedCount;
  }

  async getStats(): Promise<{
    total: number;
    byStatus: Record<NotificationStatus, number>;
    byType: Record<NotificationType, number>;
    failureRate: number;
  }> {
    const collection = this.getCollection();
    
    const total = await collection.countDocuments();
    
    // Группировка по статусам
    const statusAgg = await collection
      .aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ])
      .toArray();
    
    const byStatus = {} as Record<NotificationStatus, number>;
    statusAgg.forEach((item) => {
      byStatus[item._id as NotificationStatus] = item.count;
    });

    // Группировка по типам
    const typeAgg = await collection
      .aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ])
      .toArray();
    
    const byType = {} as Record<NotificationType, number>;
    typeAgg.forEach((item) => {
      byType[item._id as NotificationType] = item.count;
    });

    // Процент ошибок
    const failed = byStatus[NotificationStatus.FAILED] || 0;
    const sent = byStatus[NotificationStatus.SENT] || 0;
    const failureRate = sent + failed > 0 ? (failed / (sent + failed)) * 100 : 0;

    return {
      total,
      byStatus,
      byType,
      failureRate,
    };
  }
}
