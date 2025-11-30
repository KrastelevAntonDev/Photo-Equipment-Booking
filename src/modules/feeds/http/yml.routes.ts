import { Router, Request, Response } from 'express';
import { RoomService } from '@modules/rooms/application/room.service';
import { EquipmentService } from '@modules/equipment/application/equipment.service';
import { buildYmlFeed } from '@modules/feeds/application/yml-feed.builder';
import { env } from '@config/env';

const router = Router();
const roomService = new RoomService();
const equipmentService = new EquipmentService();

type FeedScope = 'all' | 'rooms' | 'equipment';

const createFeedHandler = (scope: FeedScope) => async (req: Request, res: Response) => {
  try {
    const segment = String(req.query.segment ?? '').toLowerCase();
    let includeRooms = scope === 'rooms' || scope === 'all';
    let includeEquipment = scope === 'equipment' || scope === 'all';

    if (segment === 'rooms') {
      includeRooms = true;
      includeEquipment = false;
    } else if (segment === 'equipment') {
      includeEquipment = true;
      includeRooms = false;
    }

    if (!includeRooms && !includeEquipment) {
      return res.status(400).json({ message: 'Сегмент должен быть rooms, equipment или all' });
    }

    const { assetBaseUrl, siteBaseUrl } = resolveBaseUrls(req);
    const includeCollections = req.query.collections !== '0';
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const [rooms, equipment] = await Promise.all([
      includeRooms ? roomService.getAllRooms() : Promise.resolve([]),
      includeEquipment ? equipmentService.getAllEquipment() : Promise.resolve([]),
    ]);

    const { xml, stats } = buildYmlFeed({
      rooms,
      equipment,
      includeRooms,
      includeEquipment,
      assetBaseUrl,
      siteBaseUrl,
      includeCollections,
      limit,
      shopName: 'Picasso Studio',
      companyName: 'Picasso Studio',
    });

    res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
    res.setHeader('Cache-Control', 's-maxage=900, max-age=300');
    res.setHeader('X-Feed-Offers', String(stats.totalOffers));
    res.setHeader('X-Feed-Collections', String(stats.collections));
    res.status(200).send(xml);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message });
  }
};

router.get('/yml-feed', createFeedHandler('all'));
router.get('/yml-feed/studios', createFeedHandler('rooms'));
router.get('/yml-feed/equipment', createFeedHandler('equipment'));

export default router;

function resolveBaseUrls(req: Request): { assetBaseUrl: string; siteBaseUrl: string } {
  const forwardedProto = req.get('x-forwarded-proto');
  const protocol = (forwardedProto ?? req.protocol ?? 'https').split(',')[0];
  const forwardedHost = req.get('x-forwarded-host');
  const host = forwardedHost ?? req.get('host');
  if (!host) {
    throw new Error('Не удалось определить host для генерации ссылок.');
  }
  const assetBaseUrl = `${protocol}://${host}`;
  const siteOverride = typeof req.query.site === 'string' && req.query.site ? req.query.site : undefined;
  const siteBaseUrl = siteOverride ?? env.PUBLIC_SITE_URL ?? assetBaseUrl;
  return {
    assetBaseUrl,
    siteBaseUrl,
  };
}
