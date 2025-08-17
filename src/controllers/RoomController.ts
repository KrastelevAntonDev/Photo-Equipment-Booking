import { Request, Response } from 'express';
import { RoomService } from '../services/RoomService';
import { Room } from '../models/Room';

export class RoomController {
  private roomService: RoomService;

  constructor() {
    this.roomService = new RoomService();
  }

  async getAllRooms(req: Request, res: Response) {
    try {
      const rooms = await this.roomService.getAllRooms();
      res.json(rooms);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errorMessage });
    }
  }

  async createRoom(req: Request, res: Response) {
    try {
      const room: Room = req.body;
      const newRoom = await this.roomService.createRoom(room);
      res.status(201).json(newRoom);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errorMessage });
    }
  }

  async getRoomById(req: Request, res: Response) {
    try {
      const room = await this.roomService.getRoomById(req.params.id);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      res.json(room);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errorMessage });
    }
  }
}