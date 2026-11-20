/**
 * DOKU notifications: decode, status mapping, and the neutral `PaidEvent`.
 *
 * External input enters as TEXT and leaves as a domain type. `parseDokuNotification`
 * is the only place a DOKU payload is trusted, and it rejects anything whose
 * amount is not whole rupiah or whose currency is not IDR — a paid event with a
 * wrong amount must never reach the invoice.
 */
import { z } from "zod";
import { DOKU_CURRENCY, DOKU_MAX_AMOUNT_IDR, DOKU_PROVIDER } from "./constants";
import { parseDokuTimestamp } from "./datetime";
import { decodeJson } from "./json";

/** How a DOKU status resolves on our side. */
export type DokuPaymentState = "paid" | "failed" | "expired" | "pending";

/**
 * Spec mapping: `SUCCESS` → paid; `FAILED`/`EXPIRED` → failed/expired;
 * `REFUNDED`/`VOIDED` are terminal-but-not-paid and map to failed so a reconcile
 * never treats them as an outstanding charge; anything else → pending.
 */
export function dokuStatusToPaymentState(
  status: string | null | undefined
): DokuPaymentState {
  switch ((status ?? "").toUpperCase()) {
    case "SUCCESS":
      return "paid";
    case "FAILED":
    case "REFUNDED":
    case "VOIDED":
      return "failed";
    case "EXPIRED":
      return "expired";
    default:
      return "pending";
  }
}

/** A decoded DOKU notification, normalized to our domain shape. */
export interface DokuNotification {
  amountIdr: number;
  currency: typeof DOKU_CURRENCY;
  customerEmail: string | null;
  customerName: string | null;
  invoiceNumber: string;
  /** `transaction.date` as an instant; `null` when DOKU sent none. */
  paidAt: Date | null;
  /** Raw status, upper-cased (`SUCCESS`, `EXPIRED`, …). */
  status: string;
  transactionId: string | null;
}

export type DokuNotificationParse =
  | { ok: true; notification: DokuNotification }
  | { ok: false; reason: "malformed" | "invalid_amount" | "invalid_currency" };

/**
 * The subset of DOKU's notification body we depend on. Amount is number or
 * string (DOKU sends both); extra fields are ignored.
 */
const notificationSchema = z.object({
  acquirer: z.object({ id: z.string() }).optional(),
  channel: z.object({ id: z.string() }).optional(),
  customer: z
    .object({ email: z.string().optional(), name: z.string().optional() })
    .optional(),
  order: z.object({
    amount: z.union([z.number(), z.string()]),
    currency: z.string().optional(),
    invoice_number: z.string().min(1),
  }),
  service: z.object({ id: z.string() }).optional(),
  transaction: z.object({
    date: z.string().optional(),
    original_request_id: z.string().optional(),
    status: z.string().min(1),
  }),
});

/** Amount accepted by DOKU: a JSON number, or a digit-only string. */
const amountSchema = z.union([z.number(), z.string().regex(/^\d+$/)]);

/** Whole positive rupiah, from a JSON number or a digit-only string. */
export function normalizeAmountIdr(value: number | string): number | null {
  const parsed = amountSchema.safeParse(value);

  if (!parsed.success) {
    return null;
  }

  const amount = Number(parsed.data);

  if (
    !Number.isInteger(amount) ||
    amount <= 0 ||
    amount > DOKU_MAX_AMOUNT_IDR
  ) {
    return null;
  }

  return amount;
}

/**
 * Decode an untrusted notification body. Returns a reason on failure so a route
 * can answer 400 with a stable code, and never a partially filled object.
 */
export function parseDokuNotificationText(
  rawBody: string
): DokuNotificationParse {
  const decoded = decodeJson(notificationSchema, rawBody, {
    label: "notification",
  });

  if (!decoded.ok) {
    return { ok: false, reason: "malformed" };
  }

  const body = decoded.value;
  const amountIdr = normalizeAmountIdr(body.order.amount);

  if (amountIdr === null) {
    return { ok: false, reason: "invalid_amount" };
  }

  if (
    body.order.currency !== undefined &&
    body.order.currency.toUpperCase() !== DOKU_CURRENCY
  ) {
    return { ok: false, reason: "invalid_currency" };
  }

  const paidAt =
    body.transaction.date === undefined
      ? null
      : parseDokuTimestamp(body.transaction.date);

  if (body.transaction.date !== undefined && paidAt === null) {
    return { ok: false, reason: "malformed" };
  }

  return {
    notification: {
      amountIdr,
      currency: DOKU_CURRENCY,
      customerEmail: body.customer?.email ?? null,
      customerName: body.customer?.name ?? null,
      invoiceNumber: body.order.invoice_number,
      paidAt,
      status: body.transaction.status.toUpperCase(),
      transactionId: body.transaction.original_request_id ?? null,
    },
    ok: true,
  };
}

/** Convenience wrapper: the notification, or `null` when the body is not valid. */
export function parseDokuNotification(
  rawBody: string
): DokuNotification | null {
  const parsed = parseDokuNotificationText(rawBody);

  return parsed.ok ? parsed.notification : null;
}

/**
 * A paid DOKU payment in neutral form: what the billing side needs to activate
 * an invoice, with no DOKU field names and no framework types.
 */
export interface PaidEvent {
  amountIdr: number;
  currency: typeof DOKU_CURRENCY;
  paidAt: Date | null;
  provider: typeof DOKU_PROVIDER;
  /** Our invoice number (`order.invoice_number`). */
  reference: string;
  /** The `Request-Id` header of the notification that reported it. */
  requestId: string;
}

/** The paid event for a notification, or `null` when it is not a success. */
export function toPaidEvent(
  notification: DokuNotification,
  requestId: string
): PaidEvent | null {
  if (dokuStatusToPaymentState(notification.status) !== "paid") {
    return null;
  }

  return {
    amountIdr: notification.amountIdr,
    currency: notification.currency,
    paidAt: notification.paidAt,
    provider: DOKU_PROVIDER,
    reference: notification.invoiceNumber,
    requestId,
  };
}

/** The invoice fields the paid event is applied to. */
export interface InvoicePaymentSnapshot {
  amountIdr: number;
  currency: string;
  reference: string;
  status: DokuPaymentState;
}

export type PaidEventApplicationReason =
  | "activated"
  | "already_paid"
  | "invoice_not_pending"
  | "amount_mismatch"
  | "currency_mismatch"
  | "reference_mismatch";

export interface PaidEventApplication {
  changed: boolean;
  /** Instant to store on the invoice; carries the current value when unchanged. */
  paidAt: Date | null;
  reason: PaidEventApplicationReason;
  /** Status the invoice has after this application. */
  status: DokuPaymentState;
}

/**
 * Apply a paid event to an invoice snapshot. Idempotent: applying the same event
 * twice changes nothing the second time (`already_paid`). Every mismatch leaves
 * the invoice untouched, so a wrong amount can never mark an invoice paid.
 *
 * `paidAt: null` means "the caller keeps the current value"; the event carries
 * `paidAt: null` when DOKU omitted `transaction.date`.
 */
export function applyPaidEvent(
  invoice: InvoicePaymentSnapshot,
  event: PaidEvent
): PaidEventApplication {
  const unchanged = (
    reason: PaidEventApplicationReason
  ): PaidEventApplication => ({
    changed: false,
    paidAt: null,
    reason,
    status: invoice.status,
  });

  if (invoice.reference !== event.reference) {
    return unchanged("reference_mismatch");
  }

  if (invoice.status === "paid") {
    return unchanged("already_paid");
  }

  if (invoice.amountIdr !== event.amountIdr) {
    return unchanged("amount_mismatch");
  }

  if (invoice.currency.toUpperCase() !== event.currency) {
    return unchanged("currency_mismatch");
  }

  if (invoice.status !== "pending") {
    return unchanged("invoice_not_pending");
  }

  return {
    changed: true,
    paidAt: event.paidAt,
    reason: "activated",
    status: "paid",
  };
}
