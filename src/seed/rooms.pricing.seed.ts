import fs from 'fs';
import path from 'path';
import { connectDB, getDB } from '@config/database';
import { RoomMongoRepository } from '@modules/rooms/infrastructure/room.mongo.repository';

type CsvRecord = { studio: string; category: string; info: string };

function parseCsv(filePath: string): CsvRecord[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const rows: CsvRecord[] = [];
  let i = 0;
  const n = content.length;
  const current: string[] = [];
  let field = '';
  let inQuotes = false;
  const pushField = () => { current.push(field); field = ''; };
  const pushRow = () => {
    if (current.length) {
      rows.push({ studio: (current[0] || '').trim(), category: (current[1] || '').trim(), info: (current[2] || '').trim() });
      current.length = 0;
    }
  };
  // skip header line by collecting first row and shifting later
  while (i < n) {
    const ch = content[i++];
    if (ch === '"') {
      if (inQuotes && content[i] === '"') { field += '"'; i++; } else { inQuotes = !inQuotes; }
      continue;
    }
    if (!inQuotes && ch === ',') { pushField(); continue; }
    if (!inQuotes && (ch === '\n')) { pushField(); pushRow(); continue; }
    if (!inQuotes && (ch === '\r')) { continue; }
    field += ch;
  }
  if (field.length > 0 || current.length) { pushField(); pushRow(); }
  // drop header if present
  if (rows.length && rows[0].studio.toLowerCase().includes('студия')) rows.shift();
  return rows;
}

function extractNumber(text: string, re: RegExp): number | undefined {
  const m = text.match(re);
  if (!m) return undefined;
  const raw = (m[1] || m[0]).replace(/\s+/g, '').replace(/[^0-9]/g, '');
  return raw ? parseInt(raw, 10) : undefined;
}

function pickPricing(info: string) {
  const weekday_00_12 = extractNumber(info, /00:00\s*до\s*12:00\s*[–-]\s*([0-9\s]+)\s*р\.?/i);
  const weekday_12_24 = extractNumber(info, /12:00\s*до\s*00:00\s*[–-]\s*([0-9\s]+)\s*р\.?/i);
  const weekend = extractNumber(info, /выходные\/?праздничные.*?-\s*([0-9\s]+)\s*р\.?/i);
  return {
    weekday_00_12,
    weekday_12_24,
    weekend_holiday_00_24: weekend,
  };
}

function pickMeta(info: string) {
  const minBookingHours = extractNumber(info, /Минимальное\s+время\s+брони\s*[—-]\s*([0-9]+)\s*час/);
  const area = extractNumber(info, /Площадь\s*[—-]\s*([0-9]+)\s*кв\.?\s*м/i);
  const ceiling = extractNumber(info, /Потолки\s*[—-]\s*([0-9]+)\s*метр/);
  const hasMakeupTable = /Гримерный\s+стол/i.test(info);
  const noPassSystem = /Отсутствие\s+проходной\s+системы/i.test(info);
  const cycWall = /Циклорама/i.test(info);
  const features: string[] = [];
  if (hasMakeupTable) features.push('Гримерный стол');
  if (noPassSystem) features.push('Отсутствие проходной системы');
  const profoto = info.match(/Profoto[^\n]+/i);
  if (profoto) features.push(profoto[0].trim());
  return { minBookingHours, area, ceilingHeightMeters: ceiling, hasMakeupTable, noPassSystem, cycWall, features };
}

export async function roomPricingSeed() {
  await connectDB();
  const csvPath = path.resolve(process.cwd(), 'info.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('[seed] info.csv not found:', csvPath);
    return;
  }
  const repo = new RoomMongoRepository();
  const records = parseCsv(csvPath);
  for (const rec of records) {
    const name = rec.studio.trim();
    const category = rec.category.trim();
    const info = rec.info;
    const pricing = pickPricing(info);
    const meta = pickMeta(info);
    const sharedSpace = /общей\s+зоне/i.test(category);
    const cycWall = meta.cycWall || /циклорама/i.test(category);

    const existing = await repo.findByName(name);
    const pricePerHour = pricing.weekday_12_24 ?? pricing.weekday_00_12 ?? pricing.weekend_holiday_00_24 ?? 0;
    const patch = {
      category,
      pricing,
      sharedSpace,
      cycWall,
      hasMakeupTable: meta.hasMakeupTable,
      noPassSystem: meta.noPassSystem,
      minBookingHours: meta.minBookingHours,
      area: meta.area ?? existing?.area ?? 0,
      ceilingHeightMeters: meta.ceilingHeightMeters ?? existing?.ceilingHeightMeters,
      features: Array.from(new Set([...(existing?.features || []), ...meta.features])),
      pricePerHour: pricePerHour || existing?.pricePerHour || 0,
      updatedAt: new Date(),
    } as any;

    if (existing?._id) {
      await getDB().collection('rooms').updateOne({ _id: existing._id }, { $set: patch });
      console.log('[seed] Updated room:', name);
    } else {
      const doc: any = {
        name,
        address: existing?.address || '',
        area: patch.area || 0,
        pricePerHour: patch.pricePerHour || 0,
        category,
        minBookingHours: patch.minBookingHours,
        ceilingHeightMeters: patch.ceilingHeightMeters,
        features: patch.features || [],
        sharedSpace,
        cycWall,
        hasMakeupTable: patch.hasMakeupTable,
        noPassSystem: patch.noPassSystem,
        pricing,
        colorScheme: existing?.colorScheme || [],
        styles: existing?.styles || [],
        description: existing?.description || '',
        images: existing?.images || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const res = await getDB().collection('rooms').insertOne(doc);
      console.log('[seed] Created room:', name, res.insertedId.toString());
    }
  }
}

// Запуск скрипта
if (require.main === module) {
  roomPricingSeed()
    .then(() => {
      console.log('✅ Seed rooms pricing completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed rooms pricing failed:', error);
      process.exit(1);
    });
}