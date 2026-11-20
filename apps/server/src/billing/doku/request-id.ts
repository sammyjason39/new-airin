/**
 * The only source of randomness in this package: a DOKU `Request-Id`, which
 * must be unique per outbound request so DOKU can reject duplicates.
 *
 * It lives in its own file so the purity guard can allow exactly one exception.
 */
import { randomUUID } from "node:crypto";

/** A random UUID usable as a DOKU `Request-Id`. */
export function newRequestId(): string {
  return randomUUID();
}
