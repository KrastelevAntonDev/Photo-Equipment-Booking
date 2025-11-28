import { Collection, ObjectId } from 'mongodb';
import { getDB } from '@config/database';
import { Equipment } from '../domain/equipment.entity';
import { IEquipmentRepository } from '../domain/equipment.repository';

export class EquipmentMongoRepository implements IEquipmentRepository {
	private collection: Collection<Equipment> | null = null;

	private getCollection(): Collection<Equipment> {
		if (!this.collection) {
			this.collection = getDB().collection<Equipment>('equipment');
		}
		return this.collection;
	}

	async findAll(): Promise<Equipment[]> {
		return this.getCollection().find({ isDeleted: { $ne: true } }).toArray();
	}

	async findAllIncludingDeleted(): Promise<Equipment[]> {
		return this.getCollection().find().toArray();
	}

	async createEquipment(equipment: Equipment): Promise<Equipment> {
		const result = await this.getCollection().insertOne(equipment);
		return { ...equipment, _id: result.insertedId };
	}

	async findById(id: string): Promise<Equipment | null> {
		if (!ObjectId.isValid(id)) {
			return null;
		}
		const _id = new ObjectId(id);
		return this.getCollection().findOne({ _id });
	}

  async findByName(name: string): Promise<Equipment | null> {
    return this.getCollection().findOne({ name });
  }

	async updateEquipment(id: string, data: Partial<Equipment>): Promise<Equipment | null> {
		if (!ObjectId.isValid(id)) return null;
		const _id = new ObjectId(id);
		
		// Если обновляется totalQuantity или bookedQuantity, пересчитываем availableQuantity
		if (data.totalQuantity !== undefined || data.bookedQuantity !== undefined) {
			const current = await this.getCollection().findOne({ _id });
			if (current) {
				const totalQuantity = data.totalQuantity ?? current.totalQuantity ?? 0;
				const bookedQuantity = data.bookedQuantity ?? current.bookedQuantity ?? 0;
				data.availableQuantity = Math.max(0, totalQuantity - bookedQuantity);
			}
		}
		
		const update: any = { ...data, updatedAt: new Date() };
		delete update._id;
		const collection = this.getCollection();
		await collection.updateOne({ _id }, { $set: update });
		return collection.findOne({ _id });
	}

	async softDelete(id: string): Promise<boolean> {
		if (!ObjectId.isValid(id)) return false;
		const result = await this.getCollection().updateOne(
			{ _id: new ObjectId(id) },
			{ $set: { isDeleted: true, updatedAt: new Date() } }
		);
		return result.modifiedCount > 0;
	}
}

export default EquipmentMongoRepository;

