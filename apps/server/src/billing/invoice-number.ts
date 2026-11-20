import { DOKU_PLATFORM_PREFIX } from "./doku";

/** `SUB-YYYYMM-NNNNNN` — DOKU invoice_number / our billing reference. */
export function formatSubscriptionInvoiceNumber(
  now: Date,
  sequence: number
): string {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const seq = String(Math.max(1, Math.floor(sequence))).padStart(6, "0");

  return `${DOKU_PLATFORM_PREFIX}${year}${month}-${seq}`;
}

export function utcYearMonth(now: Date): string {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");

  return `${year}${month}`;
}
