import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { RoomMongoRepository } from '@modules/rooms/infrastructure/room.mongo.repository';
import { EquipmentMongoRepository } from '@modules/equipment/infrastructure/equipment.mongo.repository';

type UploadType = 'room' | 'equipment';

export class UploadController {
  private roomRepo = new RoomMongoRepository();
  private eqRepo = new EquipmentMongoRepository();

  // Создаем multer с динамической директорией назначения
  private makeMulterStorage() {
    return multer({
      storage: multer.diskStorage({
        destination: (req, _file, cb) => {
          const target = (req as any)._uploadTarget as { baseDir: string } | undefined;
          if (!target) return cb(new Error('Upload target not resolved'), '');
          fs.mkdirSync(target.baseDir, { recursive: true });
          cb(null, target.baseDir);
        },
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
          const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          cb(null, `${unique}-${safeOriginal}`);
        }
      }),
      limits: { fileSize: 25 * 1024 * 1024 },
    });
  }

  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      // Читаем тип и id из query, чтобы они были доступны до парсинга multipart
      const type = String(req.query.type || '').toLowerCase() as UploadType;
      const id = String(req.query.id || '');

      if (!type || !['room', 'equipment'].includes(type)) {
        return res.status(400).json({ message: 'Invalid type. Use type=room|equipment' });
      }
      if (!id) {
        return res.status(400).json({ message: 'Missing id' });
      }

      // Находим документ и вычисляем папку сохранения по имени сущности
      let baseDir: string;
      let urlBase: string;
      let entityName: string | null = null;

      if (type === 'room') {
        const room = await this.roomRepo.findById(id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        entityName = room.name;
        baseDir = path.join(__dirname, '..', '..', '..', 'public', 'uploads', 'rooms', entityName);
        urlBase = ['/public', 'uploads', 'rooms', encodeURIComponent(entityName)].join('/');
      } else {
        const eq = await this.eqRepo.findById(id);
        if (!eq) return res.status(404).json({ message: 'Equipment not found' });
        entityName = eq.name;
        baseDir = path.join(__dirname, '..', '..', '..', 'public', 'uploads', 'equipment', entityName);
        urlBase = ['/public', 'uploads', 'equipment', encodeURIComponent(entityName)].join('/');
      }

      // Кладём целевую директорию в req для storage.destination
      (req as any)._uploadTarget = { baseDir, urlBase, type, id, entityName };

      const upload = this.makeMulterStorage().single('image');
      upload(req, res, async (err: any) => {
        if (err) return next(err);
        if (!req.file) return res.status(400).json({ message: 'Файл не получен. Поле: image' });

        const target = (req as any)._uploadTarget as { baseDir: string; urlBase: string };
        const publicUrl = `${target.urlBase}/${encodeURIComponent(req.file.filename)}`;

        try {
          if (type === 'room') {
            // Добавляем ссылку в массив images (если он есть)
            const current = await this.roomRepo.findById(id);
            if (!current) return res.status(404).json({ message: 'Room not found' });
            const nextImages = Array.from(new Set([...(current.images || []), publicUrl]));
            await this.roomRepo.updateRoom(id, { images: nextImages });
          } else {
            // Для оборудования пишем в поле image (одно изображение)
            await this.eqRepo.updateEquipment(id, { image: publicUrl });
          }
        } catch (e: any) {
          return next(e);
        }

        return res.status(201).json({
          message: 'Файл успешно загружен',
          url: publicUrl,
          file: {
            originalName: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype,
            filename: req.file.filename
          }
        });
      });
    } catch (e) {
      next(e);
    }
  }
}

export default UploadController;
