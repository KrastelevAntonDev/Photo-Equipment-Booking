import { Equipment } from './equipment.entity';

export interface IEquipmentRepository {
	findAll(): Promise<Equipment[]>;
	createEquipment(equipment: Equipment): Promise<Equipment>;
	findById(id: string): Promise<Equipment | null>;
}

export default IEquipmentRepository;

