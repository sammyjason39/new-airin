/**
 * Credentials and host resolution. Credentials arrive ONLY through the injected
 * config object — this package never reads the process environment, so a caller
 * decides where the secret comes from (K-23: secrets live in env, never in code).
 *
 * Sandbox is the default and production is refused unless the caller passes
 * `allowProduction: true` explicitly. DOKU production is out of scope for
 * Workforce (K-23), so the refusal is a guard rail, not a configuration detail.
 */
import {
  DOKU_BASE_URLS,
  DOKU_CHECKOUT_PATH,
  DOKU_PRODUCTION_HOST,
} from "./constants";

export type DokuEnvironment = keyof typeof DOKU_BASE_URLS;

export type DokuConfigErrorCode =
  | "missing_credentials"
  | "invalid_base_url"
  | "production_not_allowed";

export class DokuConfigError extends Error {
  readonly code: DokuConfigErrorCode;

  constructor(code: DokuConfigErrorCode, message: string) {
    super(message);
    this.name = "DokuConfigError";
    this.code = code;
  }
}

export interface DokuCredentials {
  /** DOKU `Client-Id` for our merchant account. */
  clientId: string;
  /** DOKU Secret Key used for the HMAC (never logged, never persisted). */
  secretKey: string;
}

export interface DokuConfigInput {
  /** Required to accept the production host. Defaults to `false`. */
  allowProduction?: boolean;
  /** Override the host (staging proxy, local fake). Defaults to the env host. */
  baseUrl?: string;
  credentials: DokuCredentials;
  /** Defaults to `sandbox`. */
  environment?: DokuEnvironment;
}

export interface DokuConfig {
  allowProduction: boolean;
  /** Host without a trailing slash, e.g. `https://api-sandbox.doku.com`. */
  baseUrl: string;
  checkoutUrl: string;
  clientId: string;
  environment: DokuEnvironment;
  secretKey: string;
}

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/** True when `hostname` is a loopback name or address (a trailing dot is ignored). */
export function isLoopbackHost(hostname: string): boolean {
  return LOOPBACK_HOSTS.has(hostname.toLowerCase().replace(/\.+$/, ""));
}

/** True for DOKU's production host (and any other non-sandbox `*.doku.com`). */
export function isProductionHost(baseUrl: string): boolean {
  const hostname = hostOf(baseUrl);

  if (hostname === null) {
    return false;
  }

  if (hostname === DOKU_PRODUCTION_HOST) {
    return true;
  }

  const sandboxHost = new URL(DOKU_BASE_URLS.sandbox).hostname;

  return hostname.endsWith(".doku.com") && hostname !== sandboxHost;
}

/** True when `baseUrl` is the DOKU sandbox host. */
export function isSandboxBaseUrl(baseUrl: string): boolean {
  return hostOf(baseUrl) === new URL(DOKU_BASE_URLS.sandbox).hostname;
}

function hostOf(baseUrl: string): string | null {
  try {
    // `api.doku.com.` is the same DNS name as `api.doku.com` (the trailing dot
    // is the root label), so normalize it before the production check. Without
    // this, a trailing dot would dodge the sandbox guard.
    return new URL(baseUrl).hostname.replace(/\.+$/, "");
  } catch {
    return null;
  }
}

/**
 * Throws `production_not_allowed` when a resolved config points at DOKU
 * production without the explicit opt-in. Called where the config is built and
 * again at the outbound boundary, so a hand-built config cannot post either.
 */
export function assertProductionAllowed(config: {
  allowProduction: boolean;
  baseUrl: string;
}): void {
  if (isProductionHost(config.baseUrl) && !config.allowProduction) {
    throw new DokuConfigError(
      "production_not_allowed",
      "DOKU production is refused without allowProduction: true"
    );
  }
}

function assertBaseUrl(baseUrl: string, allowProduction: boolean): void {
  const url = (() => {
    try {
      return new URL(baseUrl);
    } catch {
      return null;
    }
  })();

  if (url === null) {
    throw new DokuConfigError("invalid_base_url", "DOKU base URL is not a URL");
  }

  const secure = url.protocol === "https:";

  const loopback = url.protocol === "http:" && isLoopbackHost(url.hostname);

  if (!(secure || loopback)) {
    throw new DokuConfigError(
      "invalid_base_url",
      "DOKU base URL must use https (http is allowed only for loopback)"
    );
  }

  assertProductionAllowed({ allowProduction, baseUrl });
}

function assertCredentials(credentials: DokuCredentials): void {
  if (
    credentials.clientId.trim().length === 0 ||
    credentials.secretKey.trim().length === 0
  ) {
    throw new DokuConfigError(
      "missing_credentials",
      "DOKU clientId and secretKey are both required"
    );
  }
}

/**
 * Validate an injected config and resolve the host. Throws `DokuConfigError`
 * with a stable `code`; never falls back to production.
 */
export function resolveDokuConfig(input: DokuConfigInput): DokuConfig {
  assertCredentials(input.credentials);

  const environment = input.environment ?? "sandbox";
  const allowProduction = input.allowProduction === true;

  const baseUrl = (input.baseUrl ?? DOKU_BASE_URLS[environment]).replace(
    /\/+$/,
    ""
  );

  assertBaseUrl(baseUrl, allowProduction);

  if (environment === "production" && !allowProduction) {
    throw new DokuConfigError(
      "production_not_allowed",
      "DOKU production is refused without allowProduction: true"
    );
  }

  return {
    allowProduction,
    baseUrl,
    checkoutUrl: `${baseUrl}${DOKU_CHECKOUT_PATH}`,
    clientId: input.credentials.clientId,
    environment,
    secretKey: input.credentials.secretKey,
  };
}
