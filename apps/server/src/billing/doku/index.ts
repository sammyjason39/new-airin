/**
 * DOKU Checkout helpers (ported from Airin Workforce `@airin/doku`).
 * Pure: no env read, no DB. Callers inject credentials, `now`, and `fetch`.
 */

export {
  buildCheckoutBody,
  type CheckoutInput,
  type CheckoutResult,
  checkoutInputSchema,
  createCheckout,
  DokuCheckoutError,
  parseCheckoutResponse,
  validateCheckoutInput,
} from "./checkout";

export {
  type DokuConfig,
  DokuConfigError,
  type DokuConfigInput,
  resolveDokuConfig,
} from "./config";

export {
  DOKU_CURRENCY,
  DOKU_PLATFORM_PREFIX,
  DOKU_PROVIDER,
  DOKU_SANDBOX_HOST,
} from "./constants";

export {
  applyPaidEvent,
  type DokuNotification,
  dokuStatusToPaymentState,
  parseDokuNotification,
  parseDokuNotificationText,
  toPaidEvent,
} from "./notification";

export { newRequestId } from "./request-id";

export { signRequest } from "./signature";

export {
  type SeenRequestStore,
  verifyDokuWebhook,
} from "./webhook";
