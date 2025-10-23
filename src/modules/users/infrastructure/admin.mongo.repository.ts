import { Collection, ObjectId } from 'mongodb';
import { getDB } from '../../../config/database';
import { Admin } from '../domain/admin.entity';
import { IAdminRepository } from '../domain/admin.repository';

export class AdminMongoRepository implements IAdminRepository {
	private collection: Collection<Admin> | null = null;

	private getCollection(): Collection<Admin> {
		if (!this.collection) {
			this.collection = getDB().collection<Admin>('admins');
		}
		return this.collection;
	}

	async getAdmin(id: string): Promise<Admin | null> {
		if (!ObjectId.isValid(id)) {
			return null;
		}
		const _id = new ObjectId(id);
		return this.getCollection().findOne({ _id });
	}

	async findAll(): Promise<Admin[]> {
		return this.getCollection().find().toArray();
	}

	async createAdmin(admin: Admin): Promise<{ status: boolean }> {
		const result = await this.getCollection().insertOne(admin);
		return { status: result.acknowledged };
	}

	async findByEmail(email: string): Promise<Admin | null> {
		return this.getCollection().findOne({ email });
	}

	async findById(id: string): Promise<Admin | null> {
		if (!ObjectId.isValid(id)) {
			return null;
		}
		const _id = new ObjectId(id);
		return this.getCollection().findOne({ _id });
	}
}

export default AdminMongoRepository;

