import { Router, Request, Response } from 'express';
import { RoomService } from '@modules/rooms/application/room.service';
import { EquipmentService } from '@modules/equipment/application/equipment.service';

const router = Router();
const roomService = new RoomService();
const equipmentService = new EquipmentService();

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

router.get('/yml-feed', async (req: Request, res: Response) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const date = new Date();
    const dateStr = date.toISOString(); // RFC3339

    // Load data
    const rooms = await roomService.getAllRooms();
    const equipment = await equipmentService.getAllEquipment();

    // Build categories: 1 - Rooms, 2 - Equipment, dynamic subcategories for room.category
    const roomCategoryId = 1;
    const equipmentCategoryId = 2;
    const categories: Array<{ id: number; name: string; parentId?: number }> = [
      { id: roomCategoryId, name: 'Услуги студии' },
      { id: equipmentCategoryId, name: 'Оборудование' },
    ];
    // Distinct room categories
    const distinctRoomCats = Array.from(
      new Set(rooms.map((r: any) => (r.category || '').toString().trim()).filter(Boolean))
    );
    let nextCatId = 100; // start dynamic ids
    const roomCatMap = new Map<string, number>();
    for (const c of distinctRoomCats) {
      roomCatMap.set(c, nextCatId);
      categories.push({ id: nextCatId, name: c, parentId: roomCategoryId });
      nextCatId++;
    }

    // Offers (skip items without image or price)
    type Offer = string;
    const offers: Offer[] = [];

    // Rooms as services
    for (const r of rooms as any[]) {
      const pictures: string[] = Array.isArray(r.images) ? r.images : [];
      const picture = pictures[0] ? (pictures[0].startsWith('http') ? pictures[0] : `${baseUrl}${pictures[0]}`) : '';
      const price = Number(r.pricing?.weekday_12_24 ?? r.pricePerHour ?? 0);
      const name = r.name ? `${r.name} — аренда зала (за час)` : 'Аренда зала';
      const desc = r.description || '';
      if (!picture || !(price > 0)) continue;
      const categoryId = r.category && roomCatMap.has(r.category) ? roomCatMap.get(r.category)! : roomCategoryId;
      const url = `${baseUrl}/rooms/${r._id?.toString?.() || ''}`;
      const offerId = `room-${(r._id?.toString?.() || r.name || Math.random().toString(36)).replace(/\s+/g, '-')}`;

      offers.push(
        `    <offer id="${xmlEscape(offerId)}" available="true">
      <url>${xmlEscape(url)}</url>
      <price>${price.toFixed(2)}</price>
      <currencyId>RUB</currencyId>
      <categoryId>${categoryId}</categoryId>
      <picture>${xmlEscape(picture)}</picture>
      <name>${xmlEscape(name)}</name>
      <description>${xmlEscape(desc)}</description>
    </offer>`
      );
    }

    // Equipment as products
    for (const e of equipment as any[]) {
      const pictures: string[] = Array.isArray((e as any).images) && (e as any).images.length ? (e as any).images : (e.image ? [e.image] : []);
      const picture = pictures[0] ? (pictures[0].startsWith('http') ? pictures[0] : `${baseUrl}${pictures[0]}`) : '';
      const price = Number(e.pricePerHour ?? 0);
      const name = e.name ? `${e.name} — аренда оборудования (за час)` : 'Аренда оборудования';
      const desc = e.description || '';
      if (!picture || !(price >= 0)) continue; // 0 допустимо — бесплатные позиции
      const url = `${baseUrl}/equipment/${e._id?.toString?.() || ''}`;
      const offerId = `equipment-${(e._id?.toString?.() || e.name || Math.random().toString(36)).replace(/\s+/g, '-')}`;

      offers.push(
        `    <offer id="${xmlEscape(offerId)}" available="true">
      <url>${xmlEscape(url)}</url>
      <price>${price.toFixed(2)}</price>
      <currencyId>RUB</currencyId>
      <categoryId>${equipmentCategoryId}</categoryId>
      <picture>${xmlEscape(picture)}</picture>
      <name>${xmlEscape(name)}</name>
      <description>${xmlEscape(desc)}</description>
    </offer>`
      );
    }

    const categoriesXml = categories
      .map(c => `      <category id="${c.id}"${c.parentId ? ` parentId="${c.parentId}"` : ''}>${xmlEscape(c.name)}</category>`) 
      .join('\n');

    const limitedOffers = offers.slice(0, 10000); // лимит на всякий случай

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${dateStr}">
  <shop>
    <name>Photo Equipment Booking</name>
    <company>Photo Equipment Booking</company>
    <url>${xmlEscape(baseUrl)}</url>
    <currencies>
      <currency id="RUB" rate="1"/>
    </currencies>
    <categories>
${categoriesXml}
    </categories>
    <offers>
${limitedOffers.join('\n')}
    </offers>
  </shop>
</yml_catalog>`;

    res.set('Content-Type', 'application/xml; charset=UTF-8');
    res.send(xml);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message: msg });
  }
});

export default router;
