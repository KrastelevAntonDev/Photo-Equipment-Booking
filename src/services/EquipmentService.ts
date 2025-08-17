import { EquipmentRepository } from '../repositories/EquipmentRepository';
import { Equipment } from '../models/Equipment';

export class EquipmentService {
  private equipmentRepository: EquipmentRepository;

  constructor() {
    this.equipmentRepository = new EquipmentRepository();
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