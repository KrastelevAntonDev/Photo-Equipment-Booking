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
}

export default EquipmentMongoRepository;

