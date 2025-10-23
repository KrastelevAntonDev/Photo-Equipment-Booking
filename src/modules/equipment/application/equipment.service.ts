import { IEquipmentRepository } from '../domain/equipment.repository';
import { EquipmentMongoRepository } from '../infrastructure/equipment.mongo.repository';
import { Equipment } from '../domain/equipment.entity';

export class EquipmentService {
  private equipmentRepository: IEquipmentRepository;

  constructor() {
    this.equipmentRepository = new EquipmentMongoRepository();
  }

  async getAllEquipment(): Promise<Equipment[]> {
    return this.equipmentRepository.findAll();
  }

  async createEquipment(equipment: Equipment): Promise<Equipment> {
    return this.equipmentRepository.createEquipment(equipment);
  }

  async getEquipmentById(id: string): Promise<Equipment | null> {
    return this.equipmentRepository.findById(id);
  }
}