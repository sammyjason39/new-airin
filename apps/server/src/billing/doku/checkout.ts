/**
 * DOKU Checkout: request body, signed `POST /checkout/v1/payment`, and the
 * response.
 *
 * No network call happens here by itself — `createCheckout` receives a `fetch`
 * function. Tests pass a fake, so the suite never touches the network.
 */
import { z } from "zod";
import {
  assertProductionAllowed,
  type DokuConfig,
  isLoopbackHost,
} from "./config";
import {
  DOKU_CURRENCY,
  DOKU_DEFAULT_DUE_MINUTES,
  DOKU_MAX_AMOUNT_IDR,
  DOKU_MAX_DUE_MINUTES,
  DOKU_MAX_REFERENCE_LENGTH,
  DOKU_PROVIDER,
} from "./constants";
import { addMinutes, parseDokuTimestamp } from "./datetime";
import { decodeJson } from "./json";
import { normalizeAmountIdr } from "./notification";
import { signRequest } from "./signature";

/** One checkout we open with DOKU; validated input, not a raw payload. */
export const checkoutInputSchema = z.object({
  /** Whole rupiah, no decimals (K-23). */
  amountIdr: z.number().int().positive().max(DOKU_MAX_AMOUNT_IDR),
  /** Per-transaction notification URL; DOKU also has an account-level one. */
  callbackUrl: z.url().max(2048).optional(),
  customer: z.object({
    email: z.email().max(254),
    name: z.string().min(1).max(255),
    phone: z.string().min(1).max(32).optional(),
  }),
  /** Expiry in minutes; DOKU defaults to 60. */
  dueMinutes: z.number().int().positive().max(DOKU_MAX_DUE_MINUTES).optional(),
  /** Channels to offer; omitted → DOKU shows everything configured. */
  methodTypes: z.array(z.string().min(1).max(64)).min(1).max(32).optional(),
  /** Our invoice number, e.g. `SUB-202610-000001`. */
  reference: z
    .string()
    .min(1)
    .max(DOKU_MAX_REFERENCE_LENGTH)
    .regex(/^[\w.:-]+$/),
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

export type CheckoutInputValidation =
  | { ok: true; input: CheckoutInput }
  | { issues: string[]; ok: false };

/** Validate a checkout request body (JSON text) at the HTTP boundary. */
export function validateCheckoutInput(
  payload: string
): CheckoutInputValidation {
  const decoded = decodeJson(checkoutInputSchema, payload);

  if (!decoded.ok) {
    return { issues: decoded.issues, ok: false };
  }

  return { input: decoded.value, ok: true };
}

/** `POST /checkout/v1/payment` body (`order` + `payment` + `customer`). */
export interface DokuCheckoutBody {
  customer: { email: string; name: string; phone?: string };
  order: {
    amount: number;
    callback_url?: string;
    currency: typeof DOKU_CURRENCY;
    invoice_number: string;
  };
  payment: {
    payment_due_date: number;
    payment_method_types?: string[];
  };
}

/** Build the JSON body DOKU expects from validated input. */
export function buildCheckoutBody(input: CheckoutInput): DokuCheckoutBody {
  const payment: DokuCheckoutBody["payment"] = {
    payment_due_date: input.dueMinutes ?? DOKU_DEFAULT_DUE_MINUTES,
  };

  if (input.methodTypes !== undefined) {
    payment.payment_method_types = [...input.methodTypes];
  }

  const order: DokuCheckoutBody["order"] = {
    amount: input.amountIdr,
    currency: DOKU_CURRENCY,
    invoice_number: input.reference,
  };

  if (input.callbackUrl !== undefined) {
    order.callback_url = input.callbackUrl;
  }

  const customer: DokuCheckoutBody["customer"] = {
    email: input.customer.email,
    name: input.customer.name,
  };

  if (input.customer.phone !== undefined) {
    customer.phone = input.customer.phone;
  }

  return { customer, order, payment };
}

/** The checkout DOKU opened: URL, expiry and the reference it echoed back. */
export interface CheckoutResult {
  amountIdr: number;
  checkoutUrl: string;
  expiresAt: Date;
  provider: typeof DOKU_PROVIDER;
  reference: string;
  requestId: string;
}

export type CheckoutResponseReason =
  | "malformed_response"
  | "amount_mismatch"
  | "reference_mismatch";

export type CheckoutResponseParse =
  | { ok: true; result: CheckoutResult }
  | { ok: false; reason: CheckoutResponseReason };

const checkoutResponseSchema = z.object({
  response: z.object({
    order: z
      .object({
        amount: z.union([z.number(), z.string()]).optional(),
        invoice_number: z.string().optional(),
      })
      .optional(),
    payment: z.object({
      expired_date: z.string().optional(),
      url: z.string().min(1),
    }),
  }),
});

/**
 * A checkout URL is a payer-facing redirect: absolute `https`, or `http` only on
 * loopback (a local fake). A relative path or a `javascript:` scheme is never a
 * DOKU checkout page and must not be handed to the browser.
 */
function isCheckoutUrl(value: string): boolean {
  try {
    const url = new URL(value);

    if (url.hostname.length === 0) {
      return false;
    }

    return (
      url.protocol === "https:" ||
      (url.protocol === "http:" && isLoopbackHost(url.hostname))
    );
  } catch {
    return false;
  }
}

/** The path DOKU signs as `Request-Target` for the checkout POST (no query). */
function checkoutRequestTarget(checkoutUrl: string): string {
  return new URL(checkoutUrl).pathname;
}

export interface ParseCheckoutResponseInput {
  amountIdr: number;
  /** Used when DOKU omits `expired_date`. */
  dueMinutes: number;
  now: Date;
  rawBody: string;
  reference: string;
  requestId: string;
}

/**
 * Decode DOKU's answer. The echoed amount and reference must match what we
 * asked for — a checkout for a different amount is never returned to a caller.
 */
export function parseCheckoutResponse(
  input: ParseCheckoutResponseInput
): CheckoutResponseParse {
  const decoded = decodeJson(checkoutResponseSchema, input.rawBody);

  if (!decoded.ok) {
    return { ok: false, reason: "malformed_response" };
  }

  const order = decoded.value.response.order;

  if (
    order?.invoice_number !== undefined &&
    order.invoice_number !== input.reference
  ) {
    return { ok: false, reason: "reference_mismatch" };
  }

  if (order?.amount !== undefined) {
    const echoed = normalizeAmountIdr(order.amount);

    if (echoed !== input.amountIdr) {
      return { ok: false, reason: "amount_mismatch" };
    }
  }

  const payment = decoded.value.response.payment;

  if (!isCheckoutUrl(payment.url)) {
    return { ok: false, reason: "malformed_response" };
  }

  const expiresAt =
    payment.expired_date === undefined
      ? addMinutes(input.now, input.dueMinutes)
      : parseDokuTimestamp(payment.expired_date);

  if (expiresAt === null) {
    return { ok: false, reason: "malformed_response" };
  }

  return {
    ok: true,
    result: {
      amountIdr: input.amountIdr,
      checkoutUrl: payment.url,
      expiresAt,
      provider: DOKU_PROVIDER,
      reference: input.reference,
      requestId: input.requestId,
    },
  };
}

/** Request init passed to the injected fetch. */
export interface DokuFetchInit {
  body: string;
  headers: Record<string, string>;
  method: string;
}

/** The part of a fetch response we read. */
export interface DokuFetchResponse {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}

/** Injected network boundary. Tests pass a fake; nothing here calls the network. */
export type DokuFetch = (
  url: string,
  init: DokuFetchInit
) => Promise<DokuFetchResponse>;

export type DokuCheckoutErrorCode =
  | "http_error"
  | "malformed_response"
  | "amount_mismatch"
  | "reference_mismatch";

export class DokuCheckoutError extends Error {
  readonly code: DokuCheckoutErrorCode;
  /** HTTP status when the failure came from DOKU, otherwise `null`. */
  readonly status: number | null;

  constructor(
    code: DokuCheckoutErrorCode,
    message: string,
    status: number | null = null
  ) {
    super(message);
    this.name = "DokuCheckoutError";
    this.code = code;
    this.status = status;
  }
}

export interface CreateCheckoutRequest {
  config: DokuConfig;
  fetch: DokuFetch;
  input: CheckoutInput;
  now: Date;
  /** Unique per request; pass `newRequestId()` from production code. */
  requestId: string;
}

/**
 * Open one DOKU Checkout session. Signs the exact JSON body it sends, calls the
 * injected fetch once, and returns the decoded result or throws
 * `DokuCheckoutError` with a stable `code`.
 */
export async function createCheckout(
  request: CreateCheckoutRequest
): Promise<CheckoutResult> {
  assertProductionAllowed(request.config);

  const body = JSON.stringify(buildCheckoutBody(request.input));

  const signed = signRequest({
    body,
    clientId: request.config.clientId,
    now: request.now,
    requestId: request.requestId,
    requestTarget: checkoutRequestTarget(request.config.checkoutUrl),
    secretKey: request.config.secretKey,
  });

  const response = await request.fetch(request.config.checkoutUrl, {
    body,
    headers: { "Content-Type": "application/json", ...signed.headers },
    method: "POST",
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new DokuCheckoutError(
      "http_error",
      "DOKU Checkout rejected the request",
      response.status
    );
  }

  const parsed = parseCheckoutResponse({
    amountIdr: request.input.amountIdr,
    dueMinutes: request.input.dueMinutes ?? DOKU_DEFAULT_DUE_MINUTES,
    now: request.now,
    rawBody,
    reference: request.input.reference,
    requestId: request.requestId,
  });

  if (!parsed.ok) {
    throw new DokuCheckoutError(
      parsed.reason,
      "DOKU Checkout answer is not usable"
    );
  }

  return parsed.result;
}
