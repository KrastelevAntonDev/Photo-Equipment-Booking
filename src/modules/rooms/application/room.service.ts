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

  async getAllRoomsForAdmin(): Promise<Room[]> {
    const rooms = await this.roomRepository.findAllIncludingDeleted();
    const withImages = await Promise.all(
      rooms.map(async (room) => {
        const images = await this.getRoomImageUrls(room.name);
        return { ...room, images } as Room;
      })
    );
    return withImages;
  }

  async deleteRoom(id: string): Promise<boolean> {
    return this.roomRepository.softDelete(id);
  }

  async createRoom(room: Room): Promise<Room> {
    return this.roomRepository.createRoom(room);
  }

  async updateRoom(id: string, data: Partial<Room>): Promise<Room | null> {
    return this.roomRepository.updateRoom(id, data);
  }

  async getRoomById(id: string): Promise<Room | null> {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      return null;
    }
    const images = await this.getRoomImageUrls(room.name);
    return { ...room, images } as Room;
  }

  async getRoomImagesByName(name: string): Promise<string[]> {
    return this.getRoomImageUrls(name);
  }

  private async getRoomImageUrls(roomName: string): Promise<string[]> {
    // Базовая директория загрузок для комнат (относительно dist в проде)
    const uploadsBase = path.join(__dirname, '..', '..', '..', 'public', 'uploads', 'rooms');
    const normalize = (name: string) => name.trim().toLowerCase().replace(/\s+/g, '_');
    const normalizedTarget = normalize(roomName);

    const filesSet = new Set<string>();

    const walk = async (dir: string, base: string, baseSegment: string) => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath, base, baseSegment);
        } else {
          const rel = path.relative(base, fullPath);
          const segments = rel.split(path.sep).map(s => encodeURIComponent(s));
          const url = ['/public', 'uploads', 'rooms', encodeURIComponent(baseSegment), ...segments].join('/');
          filesSet.add(url);
        }
      }
    };

    // 1) Попробуем найти реальные директории, у которых normalize(dirName) === normalizedTarget
    if (fs.existsSync(uploadsBase)) {
      const baseEntries = await fs.promises.readdir(uploadsBase, { withFileTypes: true });
      const matchedDirs = baseEntries
        .filter(e => e.isDirectory() && normalize(e.name) === normalizedTarget)
        .map(e => e.name);

      for (const realDirName of matchedDirs) {
        const roomDir = path.join(uploadsBase, realDirName);
        await walk(roomDir, roomDir, realDirName);
      }

      // 2) Фоллбек: если ничего не нашли, пробуем напрямую оригинальное и нормализованное имя
      if (matchedDirs.length === 0) {
        const fallbacks = Array.from(new Set([roomName, normalizedTarget]));
        for (const candidate of fallbacks) {
          const roomDir = path.join(uploadsBase, candidate);
          if (fs.existsSync(roomDir)) {
            await walk(roomDir, roomDir, candidate);
          }
        }
      }
    }

    return Array.from(filesSet).sort();
  }
}