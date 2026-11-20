/**
 * DOKU request signing (Non-SNAP).
 *
 * Documented component string for a POST — five `Name:value` lines joined with
 * `\n`, no trailing newline, in this order:
 *
 *   Client-Id:<clientId>
 *   Request-Id:<requestId>
 *   Request-Timestamp:<ISO-8601 UTC>
 *   Request-Target:<path>
 *   Digest:<base64(SHA-256(request body bytes))>
 *
 * The `Signature` header is `HMACSHA256=` + base64(HMAC-SHA256(secretKey,
 * componentString)). GET/DELETE carry no body, so the `Digest` line is omitted.
 *
 * Sources (DOKU documentation, not another provider's code):
 *   https://developers.doku.com/get-started-with-doku-api/signature-component/non-snap/signature-component-from-request-header
 *   https://developers.doku.com/get-started-with-doku-api/signature-component/non-snap/sample-code
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import {
  DOKU_HEADERS,
  DOKU_SIGNATURE_COMPONENTS,
  DOKU_SIGNATURE_PREFIX,
} from "./constants";
import { isoUtcNoMillis } from "./datetime";

export interface SignatureComponents {
  clientId: string;
  /** `base64(SHA-256(body))`; omit or `null` for GET/DELETE. */
  digest?: string | null;
  requestId: string;
  /** Path only (no host), e.g. `/checkout/v1/payment`. */
  requestTarget: string;
  /** ISO-8601 UTC, e.g. `2020-08-11T08:45:42Z`. */
  requestTimestamp: string;
}

export type DokuRequestHeaders = {
  "Client-Id": string;
  "Request-Id": string;
  "Request-Timestamp": string;
  /** Present only when the request has a body. */
  Digest?: string;
  Signature: string;
};

export interface SignedRequest {
  digest: string | null;
  /** Headers to send, keyed by the documented DOKU names. */
  headers: DokuRequestHeaders;
  requestId: string;
  requestTimestamp: string;
  signature: string;
}

export interface SignRequestInput {
  /** Request body as the exact UTF-8 text that will be sent; `null` for GET. */
  body?: string | null;
  clientId: string;
  /** The instant signed as `Request-Timestamp`. */
  now: Date;
  /** Unique per request (DOKU uses it to reject duplicates). */
  requestId: string;
  /** Path only, e.g. `/checkout/v1/payment`. */
  requestTarget: string;
  secretKey: string;
}

/** The exact component string DOKU signs, `\n`-joined with no trailing newline. */
export function buildSignatureComponent(
  components: SignatureComponents
): string {
  const lines = [
    `Client-Id:${components.clientId}`,
    `Request-Id:${components.requestId}`,
    `Request-Timestamp:${components.requestTimestamp}`,
    `Request-Target:${components.requestTarget}`,
  ];

  if (
    components.digest !== undefined &&
    components.digest !== null &&
    components.digest !== ""
  ) {
    lines.push(`Digest:${components.digest}`);
  }

  return lines.join("\n");
}

/** Component labels in documented order — the signer and tests share one list. */
export function signatureComponentLabels(): string[] {
  return [...DOKU_SIGNATURE_COMPONENTS];
}

/** `base64(SHA-256(body))` over the exact UTF-8 bytes. */
export function generateDigest(body: string): string {
  return createHash("sha256").update(body, "utf8").digest("base64");
}

/** `HMACSHA256=` + base64 HMAC-SHA256 of the component string. */
export function signComponent(
  secretKey: string,
  components: SignatureComponents
): string {
  const hmac = createHmac("sha256", secretKey)
    .update(buildSignatureComponent(components), "utf8")
    .digest("base64");

  return DOKU_SIGNATURE_PREFIX + hmac;
}

/**
 * Sign one outbound request: digest, component string, HMAC, and the headers
 * DOKU expects. `now` and `requestId` are arguments so a test or a replay log
 * can pin them exactly.
 */
export function signRequest(input: SignRequestInput): SignedRequest {
  const requestTimestamp = isoUtcNoMillis(input.now);

  const digest =
    input.body === undefined || input.body === null
      ? null
      : generateDigest(input.body);

  const signature = signComponent(input.secretKey, {
    clientId: input.clientId,
    digest,
    requestId: input.requestId,
    requestTarget: input.requestTarget,
    requestTimestamp,
  });

  const headers: DokuRequestHeaders = {
    [DOKU_HEADERS.clientId]: input.clientId,
    [DOKU_HEADERS.requestId]: input.requestId,
    [DOKU_HEADERS.requestTimestamp]: requestTimestamp,
    [DOKU_HEADERS.signature]: signature,
  };

  if (digest !== null) {
    headers[DOKU_HEADERS.digest] = digest;
  }

  return {
    digest,
    headers,
    requestId: input.requestId,
    requestTimestamp,
    signature,
  };
}

/**
 * Constant-time string comparison. A length mismatch returns false without
 * comparing bytes (the length is not a secret; the content is).
 */
export function constantTimeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}
