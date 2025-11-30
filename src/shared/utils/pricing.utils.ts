const HOURLY_PATTERNS = [
  /(\d[\d\s,.]*)\s*(?:р|руб|₽)?\s*(?:\/|\bв\b)?\s*час/iu,
  /(\d[\d\s,.]*)\s*(?:р|руб|₽)?\s*ч\b/iu,
];

const SHIFT_PATTERN = /(\d[\d\s,.]*)\s*(?:р|руб|₽)?[^\d]{0,10}смен/iu;
const ANY_NUMBER_PATTERN = /(\d[\d\s,.]*)/u;
const FREE_PATTERN = /(входит|входят|входит\s+в|бесплат|free)/iu;

export interface ComputeHourlyPriceOptions {
  defaultShiftHours?: number;
  treatIncludedAsZero?: boolean;
}

function extractNumber(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const match = raw.replace(/\u00a0/g, ' ').match(/-?\d[\d\s,.]*/u);
  if (!match) return null;
  const normalized = match[0].replace(/\s+/g, '').replace(',', '.');
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function normalizeMoney(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    return extractNumber(value);
  }
  return null;
}

export function textMentionsFree(text?: string | null): boolean {
  if (!text) return false;
  return FREE_PATTERN.test(text);
}

export function computeHourlyPriceFromText(
  text: string | null | undefined,
  options: ComputeHourlyPriceOptions = {},
): number | null {
  if (!text) return null;
  const normalized = text.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ');

  for (const pattern of HOURLY_PATTERNS) {
    const match = normalized.match(pattern);
    if (match) {
      const value = extractNumber(match[1]);
      if (value !== null) {
        return roundMoney(Math.max(0, value));
      }
    }
  }

  if (options.treatIncludedAsZero !== false && textMentionsFree(normalized)) {
    return 0;
  }

  const shiftMatch = normalized.match(SHIFT_PATTERN);
  if (shiftMatch) {
    const shiftValue = extractNumber(shiftMatch[1]);
    if (shiftValue !== null) {
      const hours = options.defaultShiftHours ?? 12;
      return roundMoney(Math.max(0, shiftValue / Math.max(1, hours)));
    }
  }

  const anyMatch = normalized.match(ANY_NUMBER_PATTERN);
  if (anyMatch) {
    const value = extractNumber(anyMatch[1]);
    if (value !== null) {
      return roundMoney(Math.max(0, value));
    }
  }

  return null;
}

