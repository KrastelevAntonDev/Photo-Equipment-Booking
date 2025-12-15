import { Request, Response } from 'express';
import { MakeupRoomService } from '../application/makeup-room.service';

export class MakeupRoomController {
  private service: MakeupRoomService;

  constructor() {
    this.service = new MakeupRoomService();
  }

  async getAll(req: Request, res: Response) {
    try {
      const makeupRooms = await this.service.getAllMakeupRooms();
      res.json(makeupRooms);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const makeupRoom = await this.service.getMakeupRoomById(req.params.id);
      if (!makeupRoom) {
        return res.status(404).json({ message: 'Makeup room not found' });
      }
      res.json(makeupRoom);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const makeupRoom = await this.service.createMakeupRoom(req.body);
      res.status(201).json(makeupRoom);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : String(error) });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const makeupRoom = await this.service.updateMakeupRoom(req.params.id, req.body);
      if (!makeupRoom) {
        return res.status(404).json({ message: 'Makeup room not found' });
      }
      res.json(makeupRoom);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : String(error) });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const deleted = await this.service.deleteMakeupRoom(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Makeup room not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
    }
  }
}
