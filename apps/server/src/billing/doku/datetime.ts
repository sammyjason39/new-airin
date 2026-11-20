/**
 * Date helpers. DOKU writes `expired_date` / notification dates as
 * `yyyyMMddHHmmss` in UTC+7 (Jakarta, no DST); our API speaks ISO-8601 UTC.
 * Every function here takes the instant it needs — nothing reads the clock.
 */

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

const COMPACT_DATE = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/;

const SPACED_DATE = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/;

/** ISO-8601 UTC with second precision and no milliseconds (`2020-08-11T08:45:42Z`). */
export function isoUtcNoMillis(instant: Date): string {
  return instant.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function fromWibParts(parts: string[]): Date | null {
  const [year, month, day, hour, minute, second] = parts.map(Number);

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return null;
  }

  const utcMs =
    Date.UTC(year, month - 1, day, hour, minute, second) - WIB_OFFSET_MS;

  const result = new Date(utcMs);

  // Reject impossible calendar days (31 February) instead of rolling over.
  const roundTrip = new Date(utcMs + WIB_OFFSET_MS);

  if (roundTrip.getUTCDate() !== day || roundTrip.getUTCMonth() !== month - 1) {
    return null;
  }

  return result;
}

/**
 * Parse a DOKU date into an instant: `yyyyMMddHHmmss` (UTC+7),
 * `yyyy-MM-dd HH:mm:ss` (UTC+7) or ISO-8601. Returns `null` when the value does
 * not parse — never a guessed date.
 */
export function parseDokuTimestamp(value: string): Date | null {
  const compact = COMPACT_DATE.exec(value.trim());

  if (compact) {
    return fromWibParts(compact.slice(1));
  }

  const spaced = SPACED_DATE.exec(value.trim());

  if (spaced) {
    return fromWibParts(spaced.slice(1));
  }

  const parsed = Date.parse(value);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return new Date(parsed);
}

/** `instant` plus whole minutes; negative values go backwards. */
export function addMinutes(instant: Date, minutes: number): Date {
  return new Date(instant.getTime() + minutes * 60 * 1000);
}

/** `instant` plus whole hours. */
export function addHours(instant: Date, hours: number): Date {
  return new Date(instant.getTime() + hours * 60 * 60 * 1000);
}
