import { DOKU_CHECKOUT_ENABLED } from "@airin/core/billing";
import { type DokuConfig, resolveDokuConfig } from "./doku";

/**
 * Read DOKU credentials from the process env.
 * Returns null while `DOKU_CHECKOUT_ENABLED` is false (payment goes to WhatsApp).
 * Sandbox by default; set `AIRIN_DOKU_ALLOW_PRODUCTION=1` for production host.
 */
export function resolveAirinDokuConfig(
  env: NodeJS.ProcessEnv = process.env
): DokuConfig | null {
  if (!DOKU_CHECKOUT_ENABLED) {
    return null;
  }

  const clientId = env.AIRIN_DOKU_CLIENT_ID?.trim();
  const secretKey = env.AIRIN_DOKU_SECRET_KEY?.trim();

  if (!(clientId && secretKey)) {
    return null;
  }

  const environment =
    env.AIRIN_DOKU_ENVIRONMENT === "production" ? "production" : "sandbox";

  return resolveDokuConfig({
    allowProduction: env.AIRIN_DOKU_ALLOW_PRODUCTION === "1",
    baseUrl: env.AIRIN_DOKU_BASE_URL?.trim() || undefined,
    credentials: { clientId, secretKey },
    environment,
  });
}
