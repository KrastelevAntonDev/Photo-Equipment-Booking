import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { RoomMongoRepository } from '@modules/rooms/infrastructure/room.mongo.repository';
import { EquipmentMongoRepository } from '@modules/equipment/infrastructure/equipment.mongo.repository';
import { MakeupRoomMongoRepository } from '@modules/makeup-rooms/infrastructure/makeup-room.mongo.repository';
import { sanitizeFolderName } from '@shared/utils/folder.utils';

type UploadType = 'room' | 'equipment' | 'makeup-room';

interface UploadTarget {
  baseDir: string;
  urlBase: string;
  type: UploadType;
  id: string;
  entityName: string;
}

interface Entity {
  name: string;
  images?: string[];
  image?: string;
}

export class UploadController {
  private roomRepo = new RoomMongoRepository();
  private eqRepo = new EquipmentMongoRepository();
  private makeupRoomRepo = new MakeupRoomMongoRepository();

  private repos: Record<UploadType, any> = {
    room: this.roomRepo,
    equipment: this.eqRepo,
    'makeup-room': this.makeupRoomRepo,
  };

  private updateMethods: Record<UploadType, (repo: any, id: string, data: any) => Promise<any>> = {
    room: (repo, id, data) => repo.updateRoom(id, data),
    equipment: (repo, id, data) => repo.updateEquipment(id, data),
    'makeup-room': (repo, id, data) => repo.update(id, data),
  };

  private folderNames: Record<UploadType, string> = {
    room: 'rooms',
    equipment: 'equipment',
    'makeup-room': 'makeup-room',
  };

  private getImageField(type: UploadType): 'images' | 'image' {
    return type === 'equipment' ? 'image' : 'images';
  }

  private getProjectRoot(): string {
    return path.join(__dirname, '..', '..', '..');
  }

  private async getEntity(type: UploadType, id: string): Promise<Entity> {
    const repo = this.repos[type];
    const entity = await repo.findById(id);
    if (!entity) {
      throw new Error(`${type.charAt(0).toUpperCase() + type.slice(1)} not found`);
    }
    return entity;
  }

  private async setupUploadTarget(req: Request, type: UploadType, id: string): Promise<{ baseDir: string; urlBase: string }> {
    const entity = await this.getEntity(type, id);
    const safeFolderName = sanitizeFolderName(entity.name);
    const folderType = this.folderNames[type];
    const projectRoot = this.getProjectRoot();
    const baseDir = path.join(projectRoot, 'public', 'uploads', folderType, safeFolderName);
    const urlBase = `/public/uploads/${folderType}/${safeFolderName}`;
    (req as any)._uploadTarget = { baseDir, urlBase, type, id, entityName: entity.name } as UploadTarget;
    return { baseDir, urlBase };
  }

  private storage = multer.diskStorage({
    destination: (req: Request, _file, cb) => {
      const target = (req as any)._uploadTarget as UploadTarget | undefined;
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
    },
  });

  private singleUploader = multer({ storage: this.storage, limits: { fileSize: 25 * 1024 * 1024 } }).single('image');
  private multipleUploader = multer({ storage: this.storage, limits: { fileSize: 25 * 1024 * 1024 } }).array('images', 20);

  private async updateEntityImages(type: UploadType, id: string, newUrls: string[]) {
    const repo = this.repos[type];
    const updateMethod = this.updateMethods[type];
    const field = this.getImageField(type);
    const current = await this.getEntity(type, id);
    let updateData: any;

    if (field === 'images') {
      const currentImages = current.images || [];
      const nextImages = Array.from(new Set([...currentImages, ...newUrls]));
      updateData = { images: nextImages };
      console.log(`[upload] Updating ${type} ${id} with images:`, nextImages);
    } else {
      updateData = { image: newUrls[0] };
      console.log(`[upload] Updating ${type} ${id} with image:`, newUrls[0]);
    }

    const updated = await updateMethod(repo, id, updateData);
    if (!updated) {
      throw new Error(`Failed to update ${type}`);
    }
    console.log(`[upload] ${type.charAt(0).toUpperCase() + type.slice(1)} ${id} updated successfully`);
  }

  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      const type = String(req.query.type || '').toLowerCase() as UploadType;
      const id = String(req.query.id || '');

      if (!type || !Object.keys(this.repos).includes(type)) {
        return res.status(400).json({ message: 'Invalid type. Use type=room|equipment|makeup-room' });
      }
      if (!id) {
        return res.status(400).json({ message: 'Missing id' });
      }

      await this.setupUploadTarget(req, type, id);

      this.singleUploader(req, res, async (err: any) => {
        if (err) return next(err);
        if (!req.file) return res.status(400).json({ message: 'Файл не получен. Поле: image' });

        const target = (req as any)._uploadTarget as UploadTarget;
        const publicUrl = `${target.urlBase}/${req.file.filename}`;

        try {
          await this.updateEntityImages(type, id, [publicUrl]);
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
            filename: req.file.filename,
          },
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

      if (!type || !Object.keys(this.repos).includes(type)) {
        return res.status(400).json({ message: 'Invalid type. Use type=room|equipment|makeup-room' });
      }
      if (!id) {
        return res.status(400).json({ message: 'Missing id' });
      }

      await this.setupUploadTarget(req, type, id);

      this.multipleUploader(req, res, async (err: any) => {
        if (err) return next(err);
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
          return res.status(400).json({ message: 'Файлы не получены. Поле: images' });
        }

        const target = (req as any)._uploadTarget as UploadTarget;
        const uploadedUrls: string[] = req.files.map((file: any) => `${target.urlBase}/${file.filename}`);

        try {
          await this.updateEntityImages(type, id, uploadedUrls);
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
            filename: f.filename,
          })),
        });
      });
    } catch (e) {
      next(e);
    }
  }

  private async removeImageFromEntity(type: UploadType, id: string, imageUrl: string) {
    const repo = this.repos[type];
    const updateMethod = this.updateMethods[type];
    const field = this.getImageField(type);
    const current = await this.getEntity(type, id);

    if (field === 'images') {
      const images = (current.images || []).filter((url: string) => url !== imageUrl);
      await updateMethod(repo, id, { images });
    } else {
      if (current.image === imageUrl) {
        await updateMethod(repo, id, { image: '' });
      }
    }
  }

  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const type = String(req.query.type || '').toLowerCase() as UploadType;
      const id = String(req.query.id || '');
      const imageUrl = String(req.body.url || '');

      if (!type || !['room', 'equipment', 'makeup-room'].includes(type)) {
        return res.status(400).json({ message: 'Invalid type. Use type=room|equipment|makeup-room' });
      }
      if (!id) {
        return res.status(400).json({ message: 'Missing id' });
      }
      if (!imageUrl) {
        return res.status(400).json({ message: 'Missing url in body' });
      }

      const urlMatch = imageUrl.match(/\/public\/uploads\/(rooms|equipment|makeup-room)\/([^/]+)\/(.+)$/);
      if (!urlMatch) {
        return res.status(400).json({ message: 'Invalid image URL format' });
      }

      const [, urlType, entityNameEncoded, filename] = urlMatch;
      const expectedUrlType = this.folderNames[type];
      if (urlType !== expectedUrlType) {
        return res.status(400).json({ message: 'URL type mismatch' });
      }

      const entityName = decodeURIComponent(entityNameEncoded);
      const decodedFilename = decodeURIComponent(filename);
      const projectRoot = this.getProjectRoot();
      const filePath = path.join(projectRoot, 'public', 'uploads', urlType, entityName, decodedFilename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await this.removeImageFromEntity(type, id, imageUrl);

      return res.status(200).json({
        message: 'Изображение удалено',
        url: imageUrl,
      });
    } catch (e) {
      next(e);
    }
  }
}

export default UploadController;