import { Request, Response } from 'express';
import { EquipmentService } from '../services/EquipmentService';
import { Equipment } from '../models/Equipment';

export class EquipmentController {
  private equipmentService: EquipmentService;

  constructor() {
    this.equipmentService = new EquipmentService();
  }

  async getAllEquipment(req: Request, res: Response) {
    try {
      const equipment = await this.equipmentService.getAllEquipment();
      res.json(equipment);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errorMessage });
    }
  }

  async createEquipment(req: Request, res: Response) {
    try {
      const equipment: Equipment = req.body;
      const newEquipment = await this.equipmentService.createEquipment(equipment);
      res.status(201).json(newEquipment);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errorMessage });
    }
  }

  async getEquipmentById(req: Request, res: Response) {
    try {
      const equipment = await this.equipmentService.getEquipmentById(req.params.id);
      if (!equipment) {
        return res.status(404).json({ message: 'Equipment not found' });
      }
      res.json(equipment);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errorMessage });
    }
  }
}