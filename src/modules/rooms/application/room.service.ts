import { IRoomRepository } from '../domain/room.repository';
import { RoomMongoRepository } from '../infrastructure/room.mongo.repository';
import { Room } from '../domain/room.entity';
import fs from 'fs';
import path from 'path';

export class RoomService {
  private roomRepository: IRoomRepository;

  constructor() {
    this.roomRepository = new RoomMongoRepository();
  }

  async getAllRooms(): Promise<Room[]> {
    const rooms = await this.roomRepository.findAll();
    // Дополнительно подставляем URLs всех файлов из /public/uploads/rooms/<name>
    const withImages = await Promise.all(
      rooms.map(async (room) => {
        const images = await this.getRoomImageUrls(room.name);
        return { ...room, images } as Room;
      })
    );
    return withImages;
  }

  async createRoom(room: Room): Promise<Room> {
    return this.roomRepository.createRoom(room);
  }

  async getRoomById(id: string): Promise<Room | null> {
    return this.roomRepository.findById(id);
  }

  private async getRoomImageUrls(roomName: string): Promise<string[]> {
    // Базовая директория загрузок для комнат (относительно dist в проде)
    const uploadsBase = path.join(__dirname, '..', '..', '..', 'public', 'uploads', 'rooms');
    const safeName = roomName; // допускаем кириллицу и пробелы, экранируем позже только в URL
    const roomDir = path.join(uploadsBase, safeName);

    if (!fs.existsSync(roomDir)) {
      return [];
    }

    const files: string[] = [];

    const walk = async (dir: string, base: string) => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath, base);
        } else {
          const rel = path.relative(base, fullPath);
          // Собираем корректный URL с кодированием сегментов
          const segments = rel.split(path.sep).map(s => encodeURIComponent(s));
          const url = ['/public', 'uploads', 'rooms', ...safeName.split(path.sep).map(s => encodeURIComponent(s)), ...segments].join('/');
          files.push(url);
        }
      }
    };

    await walk(roomDir, roomDir);
    return files.sort();
  }
}