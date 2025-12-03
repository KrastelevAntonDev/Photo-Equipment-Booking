import { Room } from '@modules/rooms/domain/room.entity';
import { Equipment } from '@modules/equipment/domain/equipment.entity';
import { computeHourlyPriceFromText, normalizeMoney } from '@shared/utils/pricing.utils';

const ROOMS_CATEGORY_ID = 10;
const EQUIPMENT_CATEGORY_ID = 20;
const MAX_DESCRIPTION_LENGTH = 2800;
const MAX_PICTURES_PER_OFFER = 10;
const DEFAULT_LIMIT = 20000;
const STUDIO_DETAIL_PATH = '/hall';
const STUDIO_LIST_PATH = '/studios';
const EQUIPMENT_PATH = '/equipment';

/**
 * Маппинг русских названий студий на английские slug'и для URL
 */
export const STUDIO_NAME_TO_SLUG: Record<string, string> = {
  'АМСТЕРДАМ': 'amsterdam',
  'АМСТЕРДАМ (ЦИКЛОРАМА)': 'amsterdam',
  'АВАНГАРД': 'avangard',
  'АВАНГАРД (ЦИКЛОРАМА)': 'avangard',
  'АФРОДИТА': 'aphrodite',
  'БИСТРО': 'bistro',
  'БРУКЛИН': 'brooklyn',
  'КИОТО': 'kyoto',
  'КРИПТОН': 'krypton',
  'ЛОФТ РУМ': 'loftroom',
  'ЛОНДОН': 'london',
  'МАНУФАКТУРА': 'manufacture',
  'МАНУФАКТУРА (ЦИКЛОРАМА)': 'manufacture',
  'МАРРАКЕШ': 'marrakesh',
  'НИАГАРА': 'niagara',
  'ОАЗИС': 'oasis',
  'ОСТЕРИЯ': 'osteria',
  'ПОДКАСТНАЯ': 'podcast',
  'ПЬЕР': 'pierre',
  'РАЙ': 'paradise',
  'САНТОРИНИ': 'santorini',
  'САТУРН': 'saturn',
  'СИЦИЛИЯ': 'sicily',
  'ШАНХАЙ': 'shanghai',
  'ХРОМ': 'chrome',
  'ХРОМ (ЦИКЛОРАМА)': 'chrome',
  'ЧАЙКОВСКИЙ': 'tchaikovsky',
  'ЗАЛ ЧАЙКОВСКИЙ': 'tchaikovsky',
  '2 ЛИКА': 'twofaces',
};

const STUDIO_NAME_LOOKUP = new Map<string, string>();
const STUDIO_SLUG_LOOKUP = new Map<string, string>();
const STUDIO_SLUG_TO_NAME_LOOKUP = new Map<string, string>();

(function initializeStudioLookups() {
  for (const [rawName, slug] of Object.entries(STUDIO_NAME_TO_SLUG)) {
    registerStudioLookupEntry(rawName, slug);
  }
})();

/**
 * Преобразует название студии в slug для URL
 * @param studioName - Название студии (может быть на русском)
 * @returns Slug для URL (на английском) или null, если не найден
 */
export function getStudioSlug(studioName: string): string | null {
  if (!studioName) return null;
  const normalizedName = normalizeStudioName(studioName);
  if (!normalizedName) return null;

  const direct = STUDIO_NAME_LOOKUP.get(normalizedName);
  if (direct) return direct;

  const cleanedName = stripParentheses(normalizedName);
  if (cleanedName && cleanedName !== normalizedName) {
    const cleanedMatch = STUDIO_NAME_LOOKUP.get(cleanedName);
    if (cleanedMatch) return cleanedMatch;
  }

  const slugKey = normalizeSlugKey(studioName);
  if (slugKey) {
    const slugMatch = STUDIO_SLUG_LOOKUP.get(slugKey);
    if (slugMatch) return slugMatch;
  }

  if (cleanedName && cleanedName !== normalizedName) {
    const cleanedSlugKey = normalizeSlugKey(cleanedName);
    if (cleanedSlugKey) {
      const cleanedSlugMatch = STUDIO_SLUG_LOOKUP.get(cleanedSlugKey);
      if (cleanedSlugMatch) return cleanedSlugMatch;
    }
  }

  for (const [key, slug] of STUDIO_NAME_LOOKUP.entries()) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return slug;
    }
  }

  return null;
}

/**
 * Преобразует slug обратно в название студии (для поиска)
 * @param slug - Slug студии
 * @returns Русское название студии или null, если не найдено
 */
export function getStudioNameFromSlug(slug: string): string | null {
  if (!slug) return null;
  const normalizedSlug = slug.trim().toLowerCase();
  const canonicalSlug = normalizedSlug
    ? STUDIO_SLUG_LOOKUP.get(normalizeSlugKey(normalizedSlug)) ?? normalizedSlug
    : normalizedSlug;
  return canonicalSlug ? STUDIO_SLUG_TO_NAME_LOOKUP.get(canonicalSlug) ?? null : null;
}

function registerStudioLookupEntry(rawName: string, slug: string): void {
  const normalizedName = normalizeStudioName(rawName);
  if (normalizedName) {
    STUDIO_NAME_LOOKUP.set(normalizedName, slug);
  }

  const strippedName = stripParentheses(normalizedName);
  if (strippedName && strippedName !== normalizedName) {
    STUDIO_NAME_LOOKUP.set(strippedName, slug);
  }

  const slugVariants = new Set([
    normalizeSlugKey(rawName),
    normalizeSlugKey(normalizedName),
    normalizeSlugKey(strippedName),
    normalizeSlugKey(slug),
  ]);

  for (const variant of slugVariants) {
    if (variant) {
      STUDIO_SLUG_LOOKUP.set(variant, slug);
    }
  }

  const canonicalSlug = slug.trim().toLowerCase();
  if (canonicalSlug && !STUDIO_SLUG_TO_NAME_LOOKUP.has(canonicalSlug)) {
    STUDIO_SLUG_TO_NAME_LOOKUP.set(canonicalSlug, rawName);
  }
}

function normalizeStudioName(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/ё/g, 'е')
    .replace(/Ё/g, 'Е')
    .replace(/[-–—]/g, ' ')
    .replace(/[«»"“”'’]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function stripParentheses(value: string): string {
  return value.replace(/\s*\([^)]*\)/g, '').trim();
}

function normalizeSlugKey(value?: string | null): string {
  if (!value) return '';
  return slugify(value).replace(/-/g, '');
}

type OfferKind = 'room' | 'equipment';

interface OfferRecord {
  id: string;
  kind: OfferKind;
  name: string;
  url: string;
  price: number;
  categoryId: number;
  description: string;
  pictures: string[];
  params: Array<{ name: string; unit?: string; value: string }>;
  collectionIds: number[];
}

interface CategoryRecord {
  id: number;
  name: string;
  parentId?: number;
}

type CollectionType = 'room-category' | 'room-style' | 'equipment-category';

interface CollectionRecord {
  id: number;
  key: string;
  type: CollectionType;
  name: string;
  url: string;
  picture?: string;
}

interface SkippedOffer {
  id?: string;
  name?: string;
  reason: 'no-price' | 'no-image';
}

export interface BuildYmlFeedParams {
  rooms: Room[];
  equipment: Equipment[];
  includeRooms: boolean;
  includeEquipment: boolean;
  assetBaseUrl: string;
  siteBaseUrl: string;
  shopName?: string;
  companyName?: string;
  includeCollections?: boolean;
  limit?: number;
  feedUrl?: string;
}

export interface BuildYmlFeedResult {
  xml: string;
  stats: {
    totalOffers: number;
    rooms: { total: number; included: number; skipped: SkippedOffer[] };
    equipment: { total: number; included: number; skipped: SkippedOffer[] };
    collections: number;
  };
}

export function buildYmlFeed(params: BuildYmlFeedParams): BuildYmlFeedResult {
  const rooms = params.rooms ?? [];
  const equipment = params.equipment ?? [];
  const includeRooms = params.includeRooms;
  const includeEquipment = params.includeEquipment;

  if (!includeRooms && !includeEquipment) {
    throw new Error('At least one segment (rooms or equipment) must be included in the feed.');
  }

  const assetBase = trimTrailingSlash(params.assetBaseUrl);
  const siteBase = trimTrailingSlash(params.siteBaseUrl);
  const shopName = params.shopName ?? 'Picasso Studio';
  const companyName = params.companyName ?? shopName;
  const includeCollections = params.includeCollections !== false;
  const limit = params.limit ?? DEFAULT_LIMIT;

  const categories: CategoryRecord[] = [
    { id: ROOMS_CATEGORY_ID, name: 'Фотостудии' },
    { id: EQUIPMENT_CATEGORY_ID, name: 'Оборудование' },
  ];

  const roomCategoryMap = new Map<string, number>();
  const equipmentCategoryMap = new Map<string, number>();
  const collections = new Map<string, CollectionRecord>();

  let categorySeq = 100;
  let collectionSeq = 1000;

  const stats = {
    rooms: { total: 0, included: 0, skipped: [] as SkippedOffer[] },
    equipment: { total: 0, included: 0, skipped: [] as SkippedOffer[] },
  };

  const offers: OfferRecord[] = [];

  const getRoomCategoryId = (label?: string | null): number => {
    if (!label) return ROOMS_CATEGORY_ID;
    const key = normalizeKey(label);
    if (!roomCategoryMap.has(key)) {
      categorySeq += 1;
      roomCategoryMap.set(key, categorySeq);
      categories.push({ id: categorySeq, name: toTitle(label), parentId: ROOMS_CATEGORY_ID });
    }
    return roomCategoryMap.get(key)!;
  };

  const getEquipmentCategoryId = (label: string): number => {
    const key = normalizeKey(label);
    if (!equipmentCategoryMap.has(key)) {
      categorySeq += 1;
      equipmentCategoryMap.set(key, categorySeq);
      categories.push({ id: categorySeq, name: toTitle(label), parentId: EQUIPMENT_CATEGORY_ID });
    }
    return equipmentCategoryMap.get(key)!;
  };

  const addCollection = (
    offer: OfferRecord,
    type: CollectionType,
    label: string,
    path: string,
    slugSource?: string,
  ) => {
    if (!includeCollections || !label) return;
    const slug = slugify(slugSource ?? label);
    const key = `${type}:${slug}`;
    if (!collections.has(key)) {
      collectionSeq += 1;
      const url = buildUrl(siteBase, path, slug);
      collections.set(key, {
        id: collectionSeq,
        key,
        type,
        name: toTitle(label),
        url,
      });
    }
    const record = collections.get(key)!;
    if (!record.picture && offer.pictures.length) {
      record.picture = offer.pictures[0];
    }
    if (!offer.collectionIds.includes(record.id)) {
      offer.collectionIds.push(record.id);
    }
  };

  const pushOffer = (offer: OfferRecord) => {
    if (offers.length >= limit) {
      return;
    }
    offers.push(offer);
  };

  if (includeRooms) {
    for (const room of rooms) {
      stats.rooms.total += 1;
      const result = buildRoomOffer(room, {
        assetBase,
        siteBase,
        getRoomCategoryId,
        addCollection,
      });
      if ('offer' in result) {
        pushOffer(result.offer);
        stats.rooms.included += 1;
      } else {
        stats.rooms.skipped.push({
          id: room._id?.toString(),
          name: room.name,
          reason: result.reason,
        });
      }
    }
  }

  if (includeEquipment) {
	console.log('equipment', equipment);
    for (const item of equipment) {
      stats.equipment.total += 1;
      const result = buildEquipmentOffer(item, {
        assetBase,
        siteBase,
        getEquipmentCategoryId,
        addCollection,
      });
      if ('offer' in result) {
        pushOffer(result.offer);
        stats.equipment.included += 1;
      } else {
        stats.equipment.skipped.push({
          id: item._id?.toString(),
          name: item.name,
          reason: result.reason,
        });
      }
    }
  }

  const categoriesXml = categories
    .map((c) =>
      `      <category id="${c.id}"${c.parentId ? ` parentId="${c.parentId}"` : ''}>${xmlEscape(c.name)}</category>`,
    )
    .join('\n');

  const offersXml = offers
    .map((offer) => buildOfferXml(offer, { includeCollections, shopName }))
    .join('\n');

  const collectionsList = includeCollections ? Array.from(collections.values()) : [];
  const collectionsXml = includeCollections ? buildCollectionsXml(collectionsList) : '';

  const dateStr = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${dateStr}">
  <shop>
    <name>${xmlEscape(shopName)}</name>
    <company>${xmlEscape(companyName)}</company>
    <url>${xmlEscape(siteBase)}</url>
    <currencies>
      <currency id="RUB" rate="1"/>
    </currencies>
    <categories>
${categoriesXml}
    </categories>
    <offers>
${offersXml}
    </offers>${collectionsXml ? `\n${collectionsXml}\n` : '\n'}
  </shop>
</yml_catalog>`;

  return {
    xml,
    stats: {
      totalOffers: offers.length,
      rooms: stats.rooms,
      equipment: stats.equipment,
      collections: collectionsList.length,
    },
  };
}

type OfferBuildResult = { offer: OfferRecord } | { reason: 'no-price' | 'no-image' };

function buildRoomOffer(
  room: Room,
  deps: {
    assetBase: string;
    siteBase: string;
    getRoomCategoryId: (label?: string | null) => number;
    addCollection: (
      offer: OfferRecord,
      type: CollectionType,
      label: string,
      path: string,
      slugSource?: string,
    ) => void;
  },
): OfferBuildResult {
  const price = resolvePrice(
    [
      room.pricing?.weekday_12_24,
      room.pricing?.weekday_00_12,
      room.pricing?.weekend_holiday_00_24,
      room.pricePerHour,
    ],
    room.description,
  );
  if (price === null || price <= 0) {
    return { reason: 'no-price' };
  }

  const pictures = collectPictures(deps.assetBase, room.images);
  if (!pictures.length) {
    return { reason: 'no-image' };
  }

  const slug = getStudioSlug(room.name) ?? slugify(room.name);
  const roomId = room._id?.toString();
  const url = joinPath(deps.siteBase, `${STUDIO_DETAIL_PATH}/${slug}`);
  const categoryId = deps.getRoomCategoryId(room.category);

  const description = formatDescription(
    [
      room.description,
      room.features?.length ? `Особенности: ${room.features.join(', ')}` : null,
      room.address ? `Адрес: ${room.address}` : null,
      room.area ? `Площадь: ${room.area} м²` : null,
      room.minBookingHours ? `Минимальное бронирование: ${room.minBookingHours} ч` : null,
    ],
    [room.name, room.address].filter(Boolean).join('. '),
  );

  const params: OfferRecord['params'] = [];
  if (room.area) {
    params.push({ name: 'Площадь', unit: 'м²', value: String(room.area) });
  }
  if (room.minBookingHours) {
    params.push({ name: 'Минимальное бронирование', unit: 'ч', value: String(room.minBookingHours) });
  }
  if (room.category) {
    params.push({ name: 'Категория', value: room.category });
  }
  if (room.styles?.length) {
    params.push({ name: 'Стиль', value: room.styles.join(', ') });
  }

  const offer: OfferRecord = {
    id: `room-${roomId ?? slug}`,
    kind: 'room',
    name: `${room.name} — аренда зала`,
    url,
    price,
    categoryId,
    description,
    pictures,
    params,
    collectionIds: [],
  };

  if (room.category) {
    deps.addCollection(
      offer,
      'room-category',
      room.category,
      `${STUDIO_LIST_PATH}?category=`,
      room.category,
    );
  }

  if (room.styles?.length) {
    for (const style of room.styles) {
      if (!style) continue;
      deps.addCollection(
        offer,
        'room-style',
        `Студии — ${style}`,
        `${STUDIO_LIST_PATH}?style=`,
        style,
      );
    }
  }

  return { offer };
}

function buildEquipmentOffer(
  item: Equipment & { images?: string[] },
  deps: {
    assetBase: string;
    siteBase: string;
    getEquipmentCategoryId: (label: string) => number;
    addCollection: (
      offer: OfferRecord,
      type: CollectionType,
      label: string,
      path: string,
      slugSource?: string,
    ) => void;
  },
): OfferBuildResult {
  const price = resolvePrice([item.pricePerDay], item.description);
  if (price === null || price <= 0) {
    return { reason: 'no-price' };
  }

  const sourceImages = Array.isArray(item.images) && item.images.length ? item.images : item.image ? [item.image] : [];
  const pictures = collectPictures(deps.assetBase, sourceImages);
  if (!pictures.length) {
    return { reason: 'no-image' };
  }

  const { label: equipmentCategoryLabel, slug: equipmentSlug } = detectEquipmentCategory(item.name);
  const categoryId = deps.getEquipmentCategoryId(equipmentCategoryLabel);
  const equipmentId = item._id?.toString();
  const slug = slugify(item.name);
  const url = appendQuery(
    joinPath(deps.siteBase, `${EQUIPMENT_PATH}/${slug}`),
    equipmentId ? `equipmentId=${equipmentId}` : undefined,
  );

  const description = formatDescription(
    [
      item.description,
      equipmentCategoryLabel ? `Категория: ${equipmentCategoryLabel}` : null,
    ],
    item.name,
  );

  const params: OfferRecord['params'] = [];
  params.push({ name: 'Категория', value: equipmentCategoryLabel });
  if (typeof item.availableQuantity === 'number') {
    params.push({ name: 'Доступно', value: String(item.availableQuantity) });
  }

  const offer: OfferRecord = {
    id: `equipment-${equipmentId ?? slug}`,
    kind: 'equipment',
    name: `${item.name} — аренда оборудования`,
    url,
    price,
    categoryId,
    description,
    pictures,
    params,
    collectionIds: [],
  };

  deps.addCollection(
    offer,
    'equipment-category',
    equipmentCategoryLabel,
    `${EQUIPMENT_PATH}?category=`,
    equipmentSlug,
  );

  return { offer };
}

function resolvePrice(
  candidates: Array<number | string | null | undefined>,
  fallbackText?: string | null,
): number | null {
  for (const candidate of candidates) {
    const value = normalizeMoney(candidate ?? undefined);
    if (value !== null && value > 0) {
      return value;
    }
  }
  if (fallbackText) {
    const parsed = computeHourlyPriceFromText(fallbackText, { treatIncludedAsZero: false });
    if (parsed !== null && parsed > 0) {
      return parsed;
    }
  }
  return null;
}

function collectPictures(baseUrl: string, rawImages?: string[] | null): string[] {
  if (!rawImages || !rawImages.length) return [];
  const unique = Array.from(
    new Set(
      rawImages
        .map((img) => (typeof img === 'string' ? img.trim() : ''))
        .filter(Boolean),
    ),
  );
  const absolute = unique
    .map((img) => ensureAbsoluteUrl(baseUrl, img))
    .filter((url): url is string => Boolean(url));
  return absolute.slice(0, MAX_PICTURES_PER_OFFER);
}

function ensureAbsoluteUrl(baseUrl: string, raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const base = trimTrailingSlash(baseUrl);
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${path}`.replace(/([^:]\/)\/+/g, '$1');
}

function buildOfferXml(offer: OfferRecord, options: { includeCollections: boolean; shopName: string }): string {
  const price = formatPrice(offer.price);
  const picturesXml = offer.pictures.map((pic) => `      <picture>${xmlEscape(pic)}</picture>`).join('\n');
  const paramsXml = offer.params
    .map((param) => {
      const unitAttr = param.unit ? ` unit="${xmlEscape(param.unit)}"` : '';
      return `      <param name="${xmlEscape(param.name)}"${unitAttr}>${xmlEscape(param.value)}</param>`;
    })
    .join('\n');
  const collectionsXml =
    options.includeCollections && offer.collectionIds.length
      ? offer.collectionIds.map((id) => `      <collection_id>${id}</collection_id>`).join('\n')
      : '';

  return `      <offer id="${xmlEscape(offer.id)}" available="true">
        <url>${xmlEscape(offer.url)}</url>
        <price>${price}</price>
        <currencyId>RUB</currencyId>
        <categoryId>${offer.categoryId}</categoryId>
${picturesXml}
        <name>${xmlEscape(offer.name)}</name>
        <vendor>${xmlEscape(options.shopName)}</vendor>
        <description>${xmlEscape(offer.description)}</description>
${paramsXml ? `${paramsXml}\n` : ''}${collectionsXml ? `${collectionsXml}\n` : ''}      </offer>`;
}

function buildCollectionsXml(records: CollectionRecord[]): string {
  if (!records.length) {
    return '';
  }
  const items = records
    .filter((record) => Boolean(record.picture))
    .map(
      (record) => `    <collection>
      <collection_id>${record.id}</collection_id>
      <name>${xmlEscape(record.name)}</name>
      <url>${xmlEscape(record.url)}</url>
      <picture>${xmlEscape(record.picture!)}</picture>
    </collection>`,
    )
    .join('\n');

  if (!items) {
    return '';
  }

  return `    <collections>
${items}
    </collections>`;
}

function detectEquipmentCategory(name: string): { label: string; slug: string } {
  if (/(освет|light|storm|amaran|nova|d2)/i.test(name)) {
    return { label: 'Осветители', slug: 'lights' };
  }
  if (/(софтбокс|softbox|lantern|dome|octa)/i.test(name)) {
    return { label: 'Софтбоксы', slug: 'softboxes' };
  }
  if (/(линза|fresnel|spotlight|spotl[ai]t|iris|cf4)/i.test(name)) {
    return { label: 'Световые модификаторы', slug: 'light-modifiers' };
  }
  if (/(стойка|штатив|журавл|kupo|stand)/i.test(name)) {
    return { label: 'Стойки и крепления', slug: 'stands' };
  }
  if (/(монитор|телесуфлер|порткейс|сенайзер|receiver|транслятор)/i.test(name)) {
    return { label: 'Аксессуары', slug: 'accessories' };
  }
  return { label: 'Прочее оборудование', slug: 'misc-equipment' };
}

function slugify(value: string): string {
  if (!value) return 'item';
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e',
    ж: 'zh', з: 'z', и: 'i', й: 'i', к: 'k', л: 'l', м: 'm',
    н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
    ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'shch',
    ы: 'y', э: 'e', ю: 'yu', я: 'ya', ь: '', ъ: '',
  };
  const lower = value.trim().toLowerCase();
  let result = '';
  for (const char of lower) {
    if (map[char]) {
      result += map[char];
    } else if (/[a-z0-9]/.test(char)) {
      result += char;
    } else if (/[\s\-_./]/.test(char)) {
      result += '-';
    }
  }
  result = result.replace(/-+/g, '-').replace(/^-|-$/g, '');
  return result || 'item';
}

function formatDescription(parts: Array<string | null | undefined>, fallback: string): string {
  const raw = parts.filter(Boolean).join('. ');
  const sanitized = raw.replace(/\s+/g, ' ').trim();
  const base = sanitized || fallback || 'Описание будет добавлено позже.';
  return base.slice(0, MAX_DESCRIPTION_LENGTH);
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function toTitle(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return value;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function formatPrice(value: number): string {
  const normalized = Math.max(1, Math.round(value));
  return normalized.toString();
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function joinPath(base: string, path: string): string {
  if (!base.endsWith('/') && !path.startsWith('/')) {
    return `${base}/${path}`;
  }
  if (base.endsWith('/') && path.startsWith('/')) {
    return `${base}${path.substring(1)}`;
  }
  return `${base}${path}`;
}

function buildUrl(siteBase: string, path: string, slug: string): string {
  if (!path.includes('?')) {
    const trimmedPath = path.replace(/\/+$/, '');
    const composed = `${trimmedPath}/${slug}`;
    return joinPath(siteBase, composed);
  }
  const [cleanPath, queryPart] = path.split('?');
  const base = joinPath(siteBase, cleanPath);
  const query = `${queryPart}${encodeURIComponent(slug)}`;
  return appendQuery(base, query);
}

function appendQuery(url: string, query?: string): string {
  if (!query) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${query}`;
}

