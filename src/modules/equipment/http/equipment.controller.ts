import { Request, Response } from 'express';
import { EquipmentService } from '../application/equipment.service';
import { Equipment } from '../domain/equipment.entity';
import { UpdateEquipmentDTO } from './update-equipment.dto';

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

  async updateEquipment(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const dto: UpdateEquipmentDTO = req.body;
      const updated = await this.equipmentService.updateEquipment(id, dto as Partial<Equipment>);
      if (!updated) {
        return res.status(404).json({ message: 'Equipment not found' });
      }
      const withImages = await this.equipmentService.getEquipmentById(id);
      res.json(withImages);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errorMessage });
    }
  }

  async getAllEquipmentForAdmin(req: Request, res: Response) {
    try {
      const equipment = await this.equipmentService.getAllEquipmentForAdmin();
      res.json(equipment);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errorMessage });
    }
  }

  async deleteEquipment(req: Request, res: Response) {
    try {
      const deleted = await this.equipmentService.deleteEquipment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Equipment not found' });
      }
      res.json({ message: 'Equipment deleted successfully' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errorMessage });
    }
  }
}