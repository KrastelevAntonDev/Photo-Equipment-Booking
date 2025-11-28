import { Collection, ObjectId } from 'mongodb';
import { getDB } from '@config/database';
import { Admin } from '../domain/admin.entity';
import { IAdminRepository } from '../domain/admin.repository';
import { normalizePhone } from '@shared/utils/phone.utils';

export class AdminMongoRepository implements IAdminRepository {
	private collection: Collection<Admin> | null = null;

	private getCollection(): Collection<Admin> {
		if (!this.collection) {
			this.collection = getDB().collection<Admin>('admins');
		}
		return this.collection;
	}

	private normalizeAdminPhone(admin: Admin | null): Admin | null {
		if (admin && admin.phone) {
			admin.phone = normalizePhone(admin.phone);
		}
		return admin;
	}

	async getAdmin(id: string): Promise<Admin | null> {
		if (!ObjectId.isValid(id)) {
			return null;
		}
		const _id = new ObjectId(id);
		const admin = await this.getCollection().findOne({ _id });
		return this.normalizeAdminPhone(admin);
	}

	async findAll(): Promise<Admin[]> {
		const admins = await this.getCollection().find().toArray();
		return admins.map(admin => this.normalizeAdminPhone(admin)!).filter(Boolean) as Admin[];
	}

	async createAdmin(admin: Admin): Promise<{ status: boolean }> {
		const result = await this.getCollection().insertOne(admin);
		return { status: result.acknowledged };
	}

	async findByEmail(email: string): Promise<Admin | null> {
		const admin = await this.getCollection().findOne({ email });
		return this.normalizeAdminPhone(admin);
	}

	async findById(id: string): Promise<Admin | null> {
		if (!ObjectId.isValid(id)) {
			return null;
		}
		const _id = new ObjectId(id);
		const admin = await this.getCollection().findOne({ _id });
		return this.normalizeAdminPhone(admin);
	}
}

export default AdminMongoRepository;

