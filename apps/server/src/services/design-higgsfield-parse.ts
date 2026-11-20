import { AirinApiError } from "@airin/core";
import {
  type DesignSourceFileInput,
  JOB_POLL_FALLBACK_MS,
  MAX_SOURCE_FILE_BYTES,
  TERMINAL_FAILURE,
  TERMINAL_SUCCESS,
} from "./design-types";

export function readUnknownRecord<Value>(
  value: Value
): Map<string, unknown> | undefined {
  if (!(value instanceof Object) || Array.isArray(value)) {
    return;
  }

  return new Map(Object.entries(value));
}

export function readString<Value>(value: Value): (Value & string) | undefined {
  // SAFETY: The object tag check confirms the input uses the string representation.
  return Object.prototype.toString.call(value) === "[object String]"
    ? (value as Value & string)
    : undefined;
}

export function readNumber<Value>(value: Value): (Value & number) | undefined {
  // SAFETY: The object tag check confirms the input uses the number representation.
  return Object.prototype.toString.call(value) === "[object Number]"
    ? (value as Value & number)
    : undefined;
}

export function isNodeEnoent<Value>(error: Value): boolean {
  const record = readUnknownRecord(error);

  return record?.get("code") === "ENOENT";
}

export function isHiggsfieldServer(server: {
  config?: unknown;
  name: string;
}): boolean {
  if (server.name.trim().toLowerCase() === "higgsfield") {
    return true;
  }

  const config = readUnknownRecord(server.config);

  if (!config) {
    return false;
  }

  const url = readString(config.get("url")) ?? "";

  return /higgsfield\.ai/i.test(url);
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function isJobId(value: string): boolean {
  return (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    ) ||
    (/^[a-z0-9_-]{8,128}$/i.test(value) && !value.startsWith("design_"))
  );
}

function extractHttpUrlFromText(value: string): string | null {
  const match = value.match(/https?:\/\/[^\s"'<>\\]+/i);

  if (!match?.[0]) {
    return null;
  }

  return match[0].replace(/[),.;]+$/u, "");
}

export function extractResultUrl<Value>(value: Value): string | null {
  if (typeof value === "string") {
    return isHttpUrl(value) ? value : extractHttpUrlFromText(value);
  }

  const record = readUnknownRecord(value);

  if (!record) {
    return null;
  }

  for (const key of [
    "result_url",
    "resultUrl",
    "image_url",
    "imageUrl",
    "video_url",
    "videoUrl",
    "uri",
    "url",
    "output_url",
    "outputUrl",
  ]) {
    const candidate = readString(record.get(key));

    if (candidate && isHttpUrl(candidate)) {
      return candidate;
    }
  }

  for (const key of [
    "results",
    "jobs",
    "outputs",
    "images",
    "videos",
    "content",
    "data",
  ]) {
    const nested = record.get(key);

    if (Array.isArray(nested)) {
      for (const item of nested) {
        const found = extractResultUrl(item);

        if (found) {
          return found;
        }
      }
    } else if (nested != null) {
      const found = extractResultUrl(nested);

      if (found) {
        return found;
      }
    }
  }

  const text = readString(record.get("text"));

  if (text) {
    const fromText = extractHttpUrlFromText(text);

    if (fromText) {
      return fromText;
    }
  }

  return null;
}

export function extractJobId<Value>(value: Value): string | null {
  const record = readUnknownRecord(value);

  if (!record) {
    return null;
  }

  for (const key of ["job_id", "jobId", "id"]) {
    const candidate = readString(record.get(key));

    if (candidate && isJobId(candidate)) {
      return candidate;
    }
  }

  for (const key of ["results", "jobs", "data"]) {
    const nested = record.get(key);

    if (Array.isArray(nested)) {
      for (const item of nested) {
        const found = extractJobId(item);

        if (found) {
          return found;
        }
      }
    } else if (nested != null) {
      const found = extractJobId(nested);

      if (found) {
        return found;
      }
    }
  }

  return null;
}

export function normalizeStatus(
  value: string | null | undefined
): string | null {
  if (!value) {
    return null;
  }

  return value.trim().toLowerCase();
}

export function isTerminalSuccess(status: string | null): boolean {
  return status != null && TERMINAL_SUCCESS.has(status);
}

export function isTerminalFailure(status: string | null): boolean {
  return status != null && TERMINAL_FAILURE.has(status);
}

export function readPollAfterMs<Value>(value: Value): number {
  const record = readUnknownRecord(value);

  if (!record) {
    return JOB_POLL_FALLBACK_MS;
  }

  const seconds =
    readNumber(record.get("poll_after_seconds")) ??
    readNumber(record.get("pollAfterSeconds"));

  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) {
    return JOB_POLL_FALLBACK_MS;
  }

  return Math.min(Math.max(Math.round(seconds * 1000), 500), 15_000);
}

export function extractCost<Value>(value: Value): number | string | null {
  const record = readUnknownRecord(value);

  if (!record) {
    return null;
  }

  const cost = record.get("cost");
  const asNumber = readNumber(cost);
  const asString = readString(cost);

  if (asNumber !== undefined) {
    return asNumber;
  }

  if (asString !== undefined) {
    return asString;
  }

  return null;
}

export function readMediaId<Value>(imported: Value): string | null {
  const record = readUnknownRecord(imported);

  if (!record) {
    return null;
  }

  return (
    readString(record.get("media_id")) ?? readString(record.get("id")) ?? null
  );
}

export function readUploadTarget<Value>(
  raw: Value
): { mediaId: string; uploadUrl: string } | null {
  const record = readUnknownRecord(raw);

  if (!record) {
    return null;
  }

  const uploadUrl =
    readString(record.get("upload_url")) ?? readString(record.get("uploadUrl"));

  const mediaId =
    readString(record.get("media_id")) ?? readString(record.get("id"));

  if (uploadUrl && mediaId && /^https:\/\//i.test(uploadUrl)) {
    return { mediaId, uploadUrl };
  }

  for (const key of ["files", "uploads", "data", "result"]) {
    const nested = record.get(key);

    if (Array.isArray(nested)) {
      for (const item of nested) {
        const found = readUploadTarget(item);

        if (found) {
          return found;
        }
      }
    } else if (nested != null) {
      const found = readUploadTarget(nested);

      if (found) {
        return found;
      }
    }
  }

  return null;
}

export function decodeSourceFileBytes(file: DesignSourceFileInput): Buffer {
  const trimmed = file.data.trim();
  const dataUrl = trimmed.match(/^data:([^;]+);base64,(.+)$/s);
  const base64 = dataUrl ? dataUrl[2] : trimmed;
  const mediaType = dataUrl?.[1]?.trim() || file.mediaType.trim();

  if (!(mediaType.startsWith("image/") || mediaType.startsWith("video/"))) {
    throw new AirinApiError("Source files must be images or videos.", 400);
  }

  let bytes: Buffer;

  try {
    bytes = Buffer.from(base64 ?? "", "base64");
  } catch {
    throw new AirinApiError("Source file data must be valid base64.", 400);
  }

  if (bytes.byteLength === 0) {
    throw new AirinApiError("Source file is empty.", 400);
  }

  if (bytes.byteLength > MAX_SOURCE_FILE_BYTES) {
    throw new AirinApiError("Each source file must be 1.5 MB or smaller.", 400);
  }

  return bytes;
}

export function mediaConfirmType(mediaType: string): "image" | "video" {
  return mediaType.startsWith("video/") ? "video" : "image";
}

function statusFromText(value: string): string | null {
  const match = value.match(
    /(?:status\s*[:=]\s*|—\s*|–\s*|-\s*)(completed|done|ready|success|succeeded|cancelled|canceled|failed|ip_detected|nsfw|pending|running|processing|queued)\b/i
  );

  return match?.[1] ? normalizeStatus(match[1]) : null;
}

export function readToolStatus<Value>(raw: Value): string | null {
  if (typeof raw === "string") {
    return statusFromText(raw);
  }

  const record = readUnknownRecord(raw);

  if (!record) {
    return null;
  }

  const status = record.get("status");
  const asString = readString(status);
  const top = asString ?? (status == null ? null : String(status));

  if (top) {
    return normalizeStatus(top);
  }

  for (const key of ["results", "jobs", "content", "data"]) {
    const nested = record.get(key);

    if (Array.isArray(nested)) {
      for (const item of nested) {
        const found = readToolStatus(item);

        if (found) {
          return found;
        }
      }
    } else if (nested != null) {
      const found = readToolStatus(nested);

      if (found) {
        return found;
      }
    }
  }

  const text = readString(record.get("text"));

  if (text) {
    return statusFromText(text);
  }

  return null;
}
