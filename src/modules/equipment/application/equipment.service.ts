import { IEquipmentRepository } from '../domain/equipment.repository';
import { EquipmentMongoRepository } from '../infrastructure/equipment.mongo.repository';
import { Equipment } from '../domain/equipment.entity';
import fs from 'fs';
import path from 'path';

export class EquipmentService {
  private equipmentRepository: IEquipmentRepository;

  constructor() {
    this.equipmentRepository = new EquipmentMongoRepository();
  }

  async getAllEquipment(): Promise<Equipment[]> {
    const list = await this.equipmentRepository.findAll();
    const withImages = await Promise.all(
      list.map(async (item) => {
        const images = await this.getEquipmentImageUrls(item.name);
        return { ...item, images } as Equipment & { images?: string[] };
      })
    );
    return withImages as Equipment[];
  }

  async createEquipment(equipment: Equipment): Promise<Equipment> {
    return this.equipmentRepository.createEquipment(equipment);
  }

  async updateEquipment(id: string, data: Partial<Equipment>): Promise<Equipment | null> {
    return this.equipmentRepository.updateEquipment(id, data);
  }

  async getEquipmentById(id: string): Promise<Equipment | null> {
    const eq = await this.equipmentRepository.findById(id);
    if (!eq) return null;
    const images = await this.getEquipmentImageUrls(eq.name);
    return { ...eq, images } as Equipment & { images?: string[] };
  }

  private async getEquipmentImageUrls(equipmentName: string): Promise<string[]> {
    const uploadsBase = path.join(__dirname, '..', '..', '..', 'public', 'uploads', 'equipment');
    const normalize = (name: string) => name.trim().toLowerCase().replace(/\s+/g, '_');
    const normalizedTarget = normalize(equipmentName);

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
          const url = ['/public', 'uploads', 'equipment', encodeURIComponent(baseSegment), ...segments].join('/');
          filesSet.add(url);
        }
      }
    };

    if (fs.existsSync(uploadsBase)) {
      const baseEntries = await fs.promises.readdir(uploadsBase, { withFileTypes: true });
      const matchedDirs = baseEntries
        .filter(e => e.isDirectory() && normalize(e.name) === normalizedTarget)
        .map(e => e.name);

      for (const realDirName of matchedDirs) {
        const eqDir = path.join(uploadsBase, realDirName);
        await walk(eqDir, eqDir, realDirName);
      }

      if (matchedDirs.length === 0) {
        const fallbacks = Array.from(new Set([equipmentName, normalizedTarget]));
        for (const candidate of fallbacks) {
          const eqDir = path.join(uploadsBase, candidate);
          if (fs.existsSync(eqDir)) {
            await walk(eqDir, eqDir, candidate);
          }
        }
      }
    }

    return Array.from(filesSet).sort();
  }
}