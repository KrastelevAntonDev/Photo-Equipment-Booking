import { Request, Response } from 'express';
import { RoomService } from '../application/room.service';
import { Room } from '../domain/room.entity';
import { UpdateRoomDTO } from './update-room.dto';

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

  async updateRoom(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const dto: UpdateRoomDTO = req.body;
      const updated = await this.roomService.updateRoom(id, dto as Partial<Room>);
      if (!updated) {
        return res.status(404).json({ message: 'Room not found' });
      }
      // Обогащаем изображениями, как и в getRoomById
      const withImages = await this.roomService.getRoomById(id);
      res.json(withImages);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errorMessage });
    }
  }

  async getAllRoomsForAdmin(req: Request, res: Response) {
    try {
      const rooms = await this.roomService.getAllRoomsForAdmin();
      res.json(rooms);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errorMessage });
    }
  }

  async deleteRoom(req: Request, res: Response) {
    try {
      const deleted = await this.roomService.deleteRoom(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Room not found' });
      }
      res.json({ message: 'Room deleted successfully' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errorMessage });
    }
  }
}