import { Admin } from './admin.entity';

export interface IAdminRepository {
	getAdmin(id: string): Promise<Admin | null>;
	findAll(): Promise<Admin[]>;
	createAdmin(admin: Admin): Promise<{ status: boolean }>;
	findByEmail(email: string): Promise<Admin | null>;
	findById(id: string): Promise<Admin | null>;
}

export default IAdminRepository;

