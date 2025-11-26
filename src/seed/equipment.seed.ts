import fs from 'fs';
import path from 'path';
import { EquipmentMongoRepository } from '@modules/equipment/infrastructure/equipment.mongo.repository';
import { Equipment } from '@modules/equipment/domain/equipment.entity';

// Тип данных из JSON (русские ключи)
interface RawItem {
  [key: string]: any;
  'НАЗВАНИЕ'?: string | null;
  'СТОИМОСТЬ'?: string | number | null;
  'ССЫЛКА НА ФОТО'?: string | null;
  'ОПИСАНИЕ'?: string | null;
  '__parsed_extra'?: (string | null)[];
}

function toNumber(raw: string): number | null {
  const cleaned = raw.replace(/\s+/g, '').replace(',', '.');
  const m = cleaned.match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

function extractPerHourFromText(text: string): number | null {
  // Ищем выражения вида: "400 в час", "700 р в час", "1200руб в час"
  const regex = /(\d[\d\s,.]*)\s*(?:р|руб|₽)?\s*в\s*час/i;
  const m = text.match(regex);
  if (m) {
    const num = toNumber(m[1]);
    return num ?? null;
  }
  return null;
}

function extractPerShiftFromText(text: string): number | null {
  // Ищем стоимость рядом со словом "смена"
  const regex = /(\d[\d\s,.]*)\s*(?:р|руб|₽)?[^\n\d]{0,10}смена/i;
  const m = text.match(regex);
  if (m) {
    const num = toNumber(m[1]);
    return num ?? null;
  }
  return null;
}

function looksFree(text: string): boolean {
  return /входит|бесплат/i.test(text);
}

function firstNumber(text: string): number | null {
  const m = text.match(/(\d[\d\s,.]*)/);
  return m ? toNumber(m[1]) : null;
}

function normalizeStr(s?: string | null): string {
  return (s || '').toString().trim();
}

function computePricePerHour(item: RawItem): number {
  const extra = Array.isArray(item.__parsed_extra) ? item.__parsed_extra.filter(Boolean).join(' \n ') : '';
  const costStr = normalizeStr(item['СТОИМОСТЬ'] as any);
  const combined = `${costStr}\n${extra}`;

  // 1) Явная почасовая ставка
  let perHour = extractPerHourFromText(combined);
  if (perHour !== null) return Math.max(0, Math.round(perHour * 100) / 100);

  // 2) Бесплатно / входит
  if (looksFree(combined)) return 0;

  // 3) Смена -> считаем как 1/12 смены
  const perShift = extractPerShiftFromText(combined);
  if (perShift !== null) return Math.max(0, Math.round((perShift / 12) * 100) / 100);

  // 4) Любое первое число — как ставка в час (хотя бы приблизительно)
  const anyNum = firstNumber(combined);
  if (anyNum !== null) return Math.max(0, Math.round(anyNum * 100) / 100);

  // 5) Фолбэк
  return 0;
}

export async function seedEquipment() {
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
      pricePerHour: computePricePerHour(row),
      image: normalizeStr(row['ССЫЛКА НА ФОТО']) || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    };

    await repo.createEquipment(equipment);
    created++;
    console.log(`[seedEquipment] Created: ${name} (${equipment.pricePerHour}/час)`);
  }

  console.log(`[seedEquipment] Done. Created ${created} items.`);
}