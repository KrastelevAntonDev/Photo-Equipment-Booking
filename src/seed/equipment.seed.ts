import fs from 'fs';
import path from 'path';
import { connectDB } from '@config/database';
import { EquipmentMongoRepository } from '@modules/equipment/infrastructure/equipment.mongo.repository';
import { Equipment } from '@modules/equipment/domain/equipment.entity';
import { computeHourlyPriceFromText } from '@shared/utils/pricing.utils';

// Тип данных из JSON (русские ключи)
interface RawItem {
  [key: string]: any;
  'НАЗВАНИЕ'?: string | null;
  'СТОИМОСТЬ'?: string | number | null;
  'ССЫЛКА НА ФОТО'?: string | null;
  'ОПИСАНИЕ'?: string | null;
'__parsed_extra'?: (string | null)[];
}

function normalizeStr(s?: string | null): string {
  return (s || '').toString().trim();
}

function computePricePerHour(item: RawItem): number {
  const extra = Array.isArray(item.__parsed_extra) ? item.__parsed_extra.filter(Boolean).join(' \n ') : '';
  const costStr = normalizeStr(item['СТОИМОСТЬ'] as any);
  const description = normalizeStr(item['ОПИСАНИЕ']);
  const combined = [costStr, extra, description].filter(Boolean).join('\n');
  const computed = computeHourlyPriceFromText(combined, { defaultShiftHours: 12, treatIncludedAsZero: true });
  if (computed === null) {
    return 0;
  }
  return Math.max(0, computed);
}

export async function seedEquipment() {
  await connectDB();
  const repo = new EquipmentMongoRepository();
  const filePath = path.join(process.cwd(), 'fileconverts.json');
  if (!fs.existsSync(filePath)) {
    console.warn(`[seedEquipment] fileconverts.json not found at ${filePath}`);
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  let items: RawItem[] = [];
  try {
    items = JSON.parse(raw);
  } catch (e) {
    console.error('[seedEquipment] Failed to parse JSON:', e);
    return;
  }

  let created = 0;
  for (const row of items) {
    const name = normalizeStr(row['НАЗВАНИЕ']);
    if (!name) continue; // пропускаем без имени

    // Проверяем, нет ли уже такого оборудования по имени
    const exists = await repo.findByName(name);
    if (exists) {
      console.log(`[seedEquipment] Skip, exists: ${name}`);
      continue;
    }

    const descriptionParts: string[] = [];
    const desc = normalizeStr(row['ОПИСАНИЕ']);
    if (desc) descriptionParts.push(desc);
    const cost = normalizeStr(row['СТОИМОСТЬ'] as any);
    if (cost) descriptionParts.push(`Стоимость (сырье): ${cost}`);
    const extras = Array.isArray(row.__parsed_extra) ? row.__parsed_extra.filter(Boolean) as string[] : [];
    if (extras.length) descriptionParts.push(`Дополнительно: ${extras.join(' | ')}`);

    const equipment: Equipment = {
      name,
      description: descriptionParts.join('\n'),
      pricePerDay: computePricePerHour(row),
      image: normalizeStr(row['ССЫЛКА НА ФОТО']) || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    };

    await repo.createEquipment(equipment);
    created++;
    console.log(`[seedEquipment] Created: ${name} (${equipment.pricePerDay}/сутки)`);
  }

  console.log(`[seedEquipment] Done. Created ${created} items.`);
}

// Запуск скрипта
if (require.main === module) {
  seedEquipment()
    .then(() => {
      console.log('✅ Seed equipment completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed equipment failed:', error);
      process.exit(1);
    });
}