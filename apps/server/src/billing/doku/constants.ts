/**
 * DOKU constants — ONE source of truth for the signer, the webhook verifier and
 * the test vectors.
 *
 * The signature component list is transcribed from DOKU's official
 * documentation, "Signature Component from Request Header" (Non-SNAP):
 *   https://developers.doku.com/get-started-with-doku-api/signature-component/non-snap/signature-component-from-request-header
 *
 * The signed string is these five `Name:value` lines joined with `\n`, in this
 * exact order, with NO trailing newline. GET/DELETE omit the `Digest` line.
 */

/** The exact signature component names, in documented order (POST). */
export const DOKU_SIGNATURE_COMPONENTS = [
  "Client-Id",
  "Request-Id",
  "Request-Timestamp",
  "Request-Target",
  "Digest",
] as const;

/** Header names DOKU expects on requests from us and sends to us. */
export const DOKU_HEADERS = {
  clientId: "Client-Id",
  digest: "Digest",
  requestId: "Request-Id",
  requestTarget: "Request-Target",
  requestTimestamp: "Request-Timestamp",
  signature: "Signature",
} as const;

/** `Signature` header value prefix (algorithm label + base64 HMAC). */
export const DOKU_SIGNATURE_PREFIX = "HMACSHA256=";

/** Reject a notification whose timestamp is further from now than this. */
export const DOKU_MAX_CLOCK_SKEW_SECONDS = 300;

/** Checkout endpoint path (POST) — also the `Request-Target` we sign. */
export const DOKU_CHECKOUT_PATH = "/checkout/v1/payment";

/** Check Status endpoint path prefix (GET) — no Digest line for GET. */
export const DOKU_STATUS_PATH = "/orders/v1/status/";

/** Hosts per environment. The package uses `sandbox` unless told otherwise. */
export const DOKU_BASE_URLS = {
  production: "https://api.doku.com",
  sandbox: "https://api-sandbox.doku.com",
} as const;

/** DOKU production host; refused unless `allowProduction: true`. */
export const DOKU_PRODUCTION_HOST = "api.doku.com";

/** DOKU sandbox host; the only DOKU host the package uses by default. */
export const DOKU_SANDBOX_HOST = "api-sandbox.doku.com";

/** Every currency we accept. Workforce bills in whole rupiah only (K-23). */
export const DOKU_CURRENCY = "IDR";

export const DOKU_PROVIDER = "doku";

/**
 * Reference prefixes that decide who owns a payment reference:
 *  - `SUB-` platform subscription invoice (`SUB-YYYYMM-NNNNNN`)
 *  - `TOP-`/`ORD-` tenant order (top-up / order)
 * Anything else is unknown and rejected (fail closed).
 */
export const DOKU_PLATFORM_PREFIX = "SUB-";

export const DOKU_TENANT_PREFIXES = ["TOP-", "ORD-"] as const;

/** Every `transaction.status` DOKU documents for Checkout / Check Status. */
export const DOKU_STATUSES = [
  "SUCCESS",
  "FAILED",
  "EXPIRED",
  "PENDING",
  "REFUNDED",
  "TIMEOUT",
  "REDIRECT",
  "VOIDED",
] as const;

/** Payment channels offered by default (VA, QRIS, card). */
export const DOKU_DEFAULT_METHOD_TYPES = [
  "VIRTUAL_ACCOUNT_BCA",
  "VIRTUAL_ACCOUNT_BANK_MANDIRI",
  "VIRTUAL_ACCOUNT_BNI",
  "VIRTUAL_ACCOUNT_BRI",
  "QRIS",
  "CREDIT_CARD",
] as const;

/** Default checkout expiry in minutes (DOKU default is 60). */
export const DOKU_DEFAULT_DUE_MINUTES = 60;

/** DOKU's documented maximum checkout expiry (31 days). */
export const DOKU_MAX_DUE_MINUTES = 44_640;

/**
 * Largest amount we accept: whole rupiah in double precision. Above this a
 * number stops being exact, so the value would no longer be the amount we mean.
 */
export const DOKU_MAX_AMOUNT_IDR = Number.MAX_SAFE_INTEGER;

/** Reference length ceiling on `order.invoice_number` (DOKU: 64 characters). */
export const DOKU_MAX_REFERENCE_LENGTH = 64;
