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
          if (!target) {
            console.error('[upload] Upload target not resolved');
            return cb(new Error('Upload target not resolved'), '');
          }
          console.log(`[upload] Creating directory: ${target.baseDir}`);
          try {
            fs.mkdirSync(target.baseDir, { recursive: true });
            console.log(`[upload] Directory created: ${target.baseDir}`);
          } catch (err: any) {
            console.error(`[upload] Error creating directory ${target.baseDir}:`, err);
            return cb(err, '');
          }
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
      const type = String(req.query.type || '').toLowerCase() as UploadType;
      const id = String(req.query.id || '');

      if (!type || !['room', 'equipment'].includes(type)) {
        return res.status(400).json({ message: 'Invalid type. Use type=room|equipment' });
      }
      if (!id) {
        return res.status(400).json({ message: 'Missing id' });
      }

      let baseDir: string;
      let urlBase: string;
      let entityName: string | null = null;

      // Определяем корень проекта (dist в production, src в development)
      const isProduction = process.env.NODE_ENV === 'production';
      const projectRoot = isProduction 
        ? path.join(__dirname, '..', '..', '..') // dist в production
        : path.join(__dirname, '..', '..', '..'); // src в development
      
      if (type === 'room') {
        const room = await this.roomRepo.findById(id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        entityName = room.name;
        baseDir = path.join(projectRoot, 'public', 'uploads', 'rooms', entityName);
        urlBase = ['/public', 'uploads', 'rooms', encodeURIComponent(entityName)].join('/');
      } else {
        const eq = await this.eqRepo.findById(id);
        if (!eq) return res.status(404).json({ message: 'Equipment not found' });
        entityName = eq.name;
        baseDir = path.join(projectRoot, 'public', 'uploads', 'equipment', entityName);
        urlBase = ['/public', 'uploads', 'equipment', encodeURIComponent(entityName)].join('/');
      }

      (req as any)._uploadTarget = { baseDir, urlBase, type, id, entityName };

      const upload = this.makeMulterStorage().single('image');
      upload(req, res, async (err: any) => {
        if (err) return next(err);
        if (!req.file) return res.status(400).json({ message: 'Файл не получен. Поле: image' });

        const target = (req as any)._uploadTarget as { baseDir: string; urlBase: string };
        const publicUrl = `${target.urlBase}/${encodeURIComponent(req.file.filename)}`;

        try {
          if (type === 'room') {
            const current = await this.roomRepo.findById(id);
            if (!current) {
              console.error(`[upload] Room not found: ${id}`);
              return res.status(404).json({ message: 'Room not found' });
            }
            const nextImages = Array.from(new Set([...(current.images || []), publicUrl]));
            console.log(`[upload] Updating room ${id} with images:`, nextImages);
            const updated = await this.roomRepo.updateRoom(id, { images: nextImages });
            if (!updated) {
              console.error(`[upload] Failed to update room ${id}`);
              return res.status(500).json({ message: 'Failed to update room' });
            }
            console.log(`[upload] Room ${id} updated successfully`);
          } else {
            const current = await this.eqRepo.findById(id);
            if (!current) {
              console.error(`[upload] Equipment not found: ${id}`);
              return res.status(404).json({ message: 'Equipment not found' });
            }
            console.log(`[upload] Updating equipment ${id} with image:`, publicUrl);
            const updated = await this.eqRepo.updateEquipment(id, { image: publicUrl });
            if (!updated) {
              console.error(`[upload] Failed to update equipment ${id}`);
              return res.status(500).json({ message: 'Failed to update equipment' });
            }
            console.log(`[upload] Equipment ${id} updated successfully`);
          }
        } catch (e: any) {
          console.error(`[upload] Error updating ${type} ${id}:`, e);
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

  async uploadMultipleImages(req: Request, res: Response, next: NextFunction) {
    try {
      const type = String(req.query.type || '').toLowerCase() as UploadType;
      const id = String(req.query.id || '');

      if (!type || !['room', 'equipment'].includes(type)) {
        return res.status(400).json({ message: 'Invalid type. Use type=room|equipment' });
      }
      if (!id) {
        return res.status(400).json({ message: 'Missing id' });
      }

      let baseDir: string;
      let urlBase: string;
      let entityName: string | null = null;

      // Определяем корень проекта (dist в production, src в development)
      const isProduction = process.env.NODE_ENV === 'production';
      const projectRoot = isProduction 
        ? path.join(__dirname, '..', '..', '..') // dist в production
        : path.join(__dirname, '..', '..', '..'); // src в development
      
      console.log(`[upload] Multiple upload - __dirname: ${__dirname}`);
      console.log(`[upload] Multiple upload - NODE_ENV: ${process.env.NODE_ENV}`);
      console.log(`[upload] Multiple upload - projectRoot: ${projectRoot}`);
      
      if (type === 'room') {
        const room = await this.roomRepo.findById(id);
        if (!room) {
          console.error(`[upload] Room not found: ${id}`);
          return res.status(404).json({ message: 'Room not found' });
        }
        entityName = room.name;
        baseDir = path.join(projectRoot, 'public', 'uploads', 'rooms', entityName);
        urlBase = ['/public', 'uploads', 'rooms', encodeURIComponent(entityName)].join('/');
        console.log(`[upload] Multiple upload - Room: ${entityName}, baseDir: ${baseDir}, urlBase: ${urlBase}`);
      } else {
        const eq = await this.eqRepo.findById(id);
        if (!eq) {
          console.error(`[upload] Equipment not found: ${id}`);
          return res.status(404).json({ message: 'Equipment not found' });
        }
        entityName = eq.name;
        baseDir = path.join(projectRoot, 'public', 'uploads', 'equipment', entityName);
        urlBase = ['/public', 'uploads', 'equipment', encodeURIComponent(entityName)].join('/');
        console.log(`[upload] Multiple upload - Equipment: ${entityName}, baseDir: ${baseDir}, urlBase: ${urlBase}`);
      }

      (req as any)._uploadTarget = { baseDir, urlBase, type, id, entityName };

      const upload = this.makeMulterStorage().array('images', 20); // max 20 files
      upload(req, res, async (err: any) => {
        if (err) return next(err);
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
          return res.status(400).json({ message: 'Файлы не получены. Поле: images' });
        }

        const target = (req as any)._uploadTarget as { baseDir: string; urlBase: string };
        const uploadedUrls: string[] = [];

        for (const file of req.files) {
          const publicUrl = `${target.urlBase}/${encodeURIComponent(file.filename)}`;
          uploadedUrls.push(publicUrl);
        }

        try {
          if (type === 'room') {
            const current = await this.roomRepo.findById(id);
            if (!current) {
              console.error(`[upload] Room not found: ${id}`);
              return res.status(404).json({ message: 'Room not found' });
            }
            const nextImages = Array.from(new Set([...(current.images || []), ...uploadedUrls]));
            console.log(`[upload] Updating room ${id} with ${uploadedUrls.length} images:`, nextImages);
            const updated = await this.roomRepo.updateRoom(id, { images: nextImages });
            if (!updated) {
              console.error(`[upload] Failed to update room ${id}`);
              return res.status(500).json({ message: 'Failed to update room' });
            }
            console.log(`[upload] Room ${id} updated successfully`);
          } else {
            // Для equipment берём первую картинку
            const current = await this.eqRepo.findById(id);
            if (!current) {
              console.error(`[upload] Equipment not found: ${id}`);
              return res.status(404).json({ message: 'Equipment not found' });
            }
            console.log(`[upload] Updating equipment ${id} with image:`, uploadedUrls[0]);
            const updated = await this.eqRepo.updateEquipment(id, { image: uploadedUrls[0] });
            if (!updated) {
              console.error(`[upload] Failed to update equipment ${id}`);
              return res.status(500).json({ message: 'Failed to update equipment' });
            }
            console.log(`[upload] Equipment ${id} updated successfully`);
          }
        } catch (e: any) {
          console.error(`[upload] Error updating ${type} ${id}:`, e);
          return next(e);
        }

        return res.status(201).json({
          message: `Загружено файлов: ${uploadedUrls.length}`,
          urls: uploadedUrls,
          files: req.files.map((f: any) => ({
            originalName: f.originalname,
            size: f.size,
            mimeType: f.mimetype,
            filename: f.filename
          }))
        });
      });
    } catch (e) {
      next(e);
    }
  }

  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const type = String(req.query.type || '').toLowerCase() as UploadType;
      const id = String(req.query.id || '');
      const imageUrl = String(req.body.url || '');

      if (!type || !['room', 'equipment'].includes(type)) {
        return res.status(400).json({ message: 'Invalid type. Use type=room|equipment' });
      }
      if (!id) {
        return res.status(400).json({ message: 'Missing id' });
      }
      if (!imageUrl) {
        return res.status(400).json({ message: 'Missing url in body' });
      }

      // Извлекаем путь к файлу из URL
      // Формат: /public/uploads/rooms/NAME/filename.jpg
      const urlMatch = imageUrl.match(/\/public\/uploads\/(rooms|equipment)\/([^/]+)\/(.+)$/);
      if (!urlMatch) {
        return res.status(400).json({ message: 'Invalid image URL format' });
      }

      const [, urlType, entityNameEncoded, filename] = urlMatch;
      const entityName = decodeURIComponent(entityNameEncoded);
      const decodedFilename = decodeURIComponent(filename);

      // Проверяем соответствие типа
      if (urlType !== (type === 'room' ? 'rooms' : 'equipment')) {
        return res.status(400).json({ message: 'URL type mismatch' });
      }

      // Определяем корень проекта (dist в production, src в development)
      const isProduction = process.env.NODE_ENV === 'production';
      const projectRoot = isProduction 
        ? path.join(__dirname, '..', '..', '..') // dist в production
        : path.join(__dirname, '..', '..', '..'); // src в development
      const filePath = path.join(projectRoot, 'public', 'uploads', urlType, entityName, decodedFilename);

      // Удаляем файл с диска
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Удаляем URL из базы
      try {
        if (type === 'room') {
          const current = await this.roomRepo.findById(id);
          if (!current) return res.status(404).json({ message: 'Room not found' });
          const nextImages = (current.images || []).filter(url => url !== imageUrl);
          await this.roomRepo.updateRoom(id, { images: nextImages });
        } else {
          const current = await this.eqRepo.findById(id);
          if (!current) return res.status(404).json({ message: 'Equipment not found' });
          // Для equipment если это текущая картинка — очищаем
          if (current.image === imageUrl) {
            await this.eqRepo.updateEquipment(id, { image: '' });
          }
        }
      } catch (e: any) {
        return next(e);
      }

      return res.status(200).json({
        message: 'Изображение удалено',
        url: imageUrl
      });
    } catch (e) {
      next(e);
    }
  }
}

export default UploadController;
