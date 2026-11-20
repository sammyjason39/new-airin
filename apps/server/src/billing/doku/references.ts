/**
 * Reference ownership. A payment reference that starts with `SUB-` belongs to
 * the platform (our own subscription invoices), `TOP-`/`ORD-` belong to a tenant
 * order. Anything else is unknown, and an unknown reference must never resolve
 * to an account — fail closed.
 */
import { DOKU_PLATFORM_PREFIX, DOKU_TENANT_PREFIXES } from "./constants";

export type DokuReferenceOwner = "platform" | "tenant";

/** The owner a reference implies, or `null` when the prefix is not ours. */
export function ownerOfReference(reference: string): DokuReferenceOwner | null {
  if (reference.startsWith(DOKU_PLATFORM_PREFIX)) {
    return "platform";
  }

  if (DOKU_TENANT_PREFIXES.some((prefix) => reference.startsWith(prefix))) {
    return "tenant";
  }

  return null;
}
