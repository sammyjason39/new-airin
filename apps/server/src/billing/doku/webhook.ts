/**
 * Inbound DOKU webhook verification.
 *
 * Trust nothing in the body until the HMAC verifies with our Secret Key. The
 * order is deliberate and fail-closed:
 *
 *   1. required headers present
 *   2. `Client-Id` equals the configured account (a signature from another
 *      merchant is not ours, even when the HMAC is valid)
 *   3. `Request-Timestamp` inside the tolerance window (default 300 s)
 *   4. constant-time signature comparison over the exact raw body
 *   5. body decodes, amount is whole positive rupiah, currency is IDR
 *   6. the reference prefix is one we accept
 *   7. the `Request-Id` was not accepted before (replay)
 *
 * The replay store is injected: the caller owns persistence. It is asked only
 * after a request authenticates, so a forged request can never poison it.
 */
import { DOKU_HEADERS, DOKU_MAX_CLOCK_SKEW_SECONDS } from "./constants";
import {
  type DokuNotification,
  type DokuPaymentState,
  dokuStatusToPaymentState,
  type PaidEvent,
  parseDokuNotificationText,
  toPaidEvent,
} from "./notification";
import { type DokuReferenceOwner, ownerOfReference } from "./references";
import { constantTimeEqual, generateDigest, signComponent } from "./signature";

/** Inbound headers; values may be arrays when the framework repeats them. */
export type DokuHeaderBag = Record<string, string | string[] | undefined>;

/**
 * Replay memory. `seen(requestId)` records the id and answers whether it had
 * already been recorded — so a caller wiring Postgres writes one row and lets
 * the UNIQUE constraint answer, and a memory store is a `Set`.
 */
export interface SeenRequestStore {
  seen(requestId: string): boolean | Promise<boolean>;
}

export interface MemorySeenStoreOptions {
  /** Oldest ids are dropped beyond this size. Defaults to 1000. */
  capacity?: number;
}

const DEFAULT_SEEN_CAPACITY = 1000;

/**
 * Bounded in-memory replay store for tests and single-process dev. Production
 * must inject a persistent store (WF-14b: the `doku_notifications` UNIQUE key).
 */
export function createMemorySeenStore(
  options: MemorySeenStoreOptions = {}
): SeenRequestStore {
  const capacity = options.capacity ?? DEFAULT_SEEN_CAPACITY;
  const ids = new Map<string, true>();

  return {
    seen(requestId: string): boolean {
      if (ids.has(requestId)) {
        return true;
      }

      ids.set(requestId, true);

      while (ids.size > capacity) {
        const oldest = ids.keys().next();

        if (oldest.done === true) {
          break;
        }

        ids.delete(oldest.value);
      }

      return false;
    },
  };
}

export interface DokuWebhookConfig {
  /** The account we signed up with; a different Client-Id is rejected. */
  clientId: string;
  /** Allowed clock skew in seconds. Defaults to 300. */
  maxSkewSeconds?: number;
  /** Path DOKU signed as `Request-Target`, e.g. `/v1/billing/doku/webhook`. */
  requestTarget: string;
  secretKey: string;
}

export interface VerifyDokuWebhookInput {
  config: DokuWebhookConfig;
  headers: DokuHeaderBag;
  /** The instant the request arrived. */
  now: Date;
  /** The exact raw body text DOKU signed. Never a re-serialized object. */
  rawBody: string;
  /** Replay memory; required so a redelivery is always rejected. */
  seen: SeenRequestStore;
}

export type DokuWebhookRejection =
  | "missing_header"
  | "unknown_client"
  | "timestamp_skew"
  | "signature_mismatch"
  | "malformed_body"
  | "invalid_amount"
  | "invalid_currency"
  | "unknown_reference"
  | "replay";

export type DokuWebhookOutcome =
  | {
      notification: DokuNotification;
      ok: true;
      /** Reference owner, resolved from the prefix. */
      owner: DokuReferenceOwner;
      /** The neutral paid event when the notification reports success. */
      paid: PaidEvent | null;
      reference: string;
      requestId: string;
      state: DokuPaymentState;
    }
  | { ok: false; reason: DokuWebhookRejection };

/** Read a header by name, case-insensitively. Missing → empty string. */
export function readHeader(headers: DokuHeaderBag, name: string): string {
  const wanted = name.toLowerCase();

  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() !== wanted) {
      continue;
    }

    const value = headers[key];

    if (Array.isArray(value)) {
      return value[0] ?? "";
    }

    return value ?? "";
  }

  return "";
}

/** True when `timestamp` parses and is within `maxSkewSeconds` of `now`. */
export function timestampWithinSkew(
  timestamp: string,
  now: Date,
  maxSkewSeconds: number = DOKU_MAX_CLOCK_SKEW_SECONDS
): boolean {
  const parsed = Date.parse(timestamp);

  if (!Number.isFinite(parsed)) {
    return false;
  }

  return Math.abs(now.getTime() - parsed) <= maxSkewSeconds * 1000;
}

/**
 * Verify one inbound notification. On success the request id is recorded in
 * `seen`; a redelivery of the same id is rejected as `replay`.
 */
export async function verifyDokuWebhook(
  input: VerifyDokuWebhookInput
): Promise<DokuWebhookOutcome> {
  const clientId = readHeader(input.headers, DOKU_HEADERS.clientId);
  const requestId = readHeader(input.headers, DOKU_HEADERS.requestId);

  const requestTimestamp = readHeader(
    input.headers,
    DOKU_HEADERS.requestTimestamp
  );

  const signature = readHeader(input.headers, DOKU_HEADERS.signature);

  if (
    clientId.length === 0 ||
    requestId.length === 0 ||
    requestTimestamp.length === 0 ||
    signature.length === 0
  ) {
    return { ok: false, reason: "missing_header" };
  }

  if (clientId !== input.config.clientId) {
    return { ok: false, reason: "unknown_client" };
  }

  const maxSkew = input.config.maxSkewSeconds ?? DOKU_MAX_CLOCK_SKEW_SECONDS;

  if (!timestampWithinSkew(requestTimestamp, input.now, maxSkew)) {
    return { ok: false, reason: "timestamp_skew" };
  }

  // Sign the timestamp DOKU sent (not our arrival time) over the exact body.
  const expected = signComponent(input.config.secretKey, {
    clientId,
    digest: generateDigest(input.rawBody),
    requestId,
    requestTarget: input.config.requestTarget,
    requestTimestamp,
  });

  if (!constantTimeEqual(expected, signature)) {
    return { ok: false, reason: "signature_mismatch" };
  }

  const parsed = parseDokuNotificationText(input.rawBody);

  if (!parsed.ok) {
    return {
      ok: false,
      reason: parsed.reason === "malformed" ? "malformed_body" : parsed.reason,
    };
  }

  const notification = parsed.notification;
  const owner = ownerOfReference(notification.invoiceNumber);

  if (owner === null) {
    return { ok: false, reason: "unknown_reference" };
  }

  if (await input.seen.seen(requestId)) {
    return { ok: false, reason: "replay" };
  }

  return {
    notification,
    ok: true,
    owner,
    paid: toPaidEvent(notification, requestId),
    reference: notification.invoiceNumber,
    requestId,
    state: dokuStatusToPaymentState(notification.status),
  };
}
