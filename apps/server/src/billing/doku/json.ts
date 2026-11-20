/**
 * One JSON boundary helper. External payloads arrive as TEXT; this is the only
 * place the text becomes a typed value, and an untrusted payload never leaves as
 * `any`.
 */
import type { z } from "zod";

export type JsonDecode<TOutput> =
  | { ok: true; value: TOutput }
  | { issues: string[]; ok: false };

export interface DecodeJsonOptions {
  /** Prefix for issue codes when the schema reports no path. */
  label?: string;
}

/**
 * Parse `rawBody` and validate it with `schema`. Fails with `path:code` issues
 * (never with a partially decoded value) for invalid JSON or a schema mismatch.
 */
export function decodeJson<TOutput>(
  schema: z.ZodType<TOutput>,
  rawBody: string,
  options: DecodeJsonOptions = {}
): JsonDecode<TOutput> {
  const label = options.label ?? "input";

  try {
    const parsed = schema.safeParse(JSON.parse(rawBody));

    if (parsed.success) {
      return { ok: true, value: parsed.data };
    }

    return {
      issues: parsed.error.issues.map((issue) => {
        const path = issue.path.length === 0 ? label : issue.path.join(".");

        return `${path}:${issue.code}`;
      }),
      ok: false,
    };
  } catch {
    return { issues: [`${label}:invalid_json`], ok: false };
  }
}
