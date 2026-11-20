import type { DesignResult } from "./types";

const STORAGE_KEY = "airin-design-results";

const MAX_RESULTS = 100;

function readUnknownRecord<Value>(
  value: Value
): Map<string, unknown> | undefined {
  if (!(value instanceof Object) || Array.isArray(value)) {
    return;
  }

  return new Map(Object.entries(value));
}

function readString<Value>(value: Value): (Value & string) | undefined {
  // SAFETY: The object tag check confirms the input uses the string representation.
  return Object.prototype.toString.call(value) === "[object String]"
    ? (value as Value & string)
    : undefined;
}

function isDesignResult(value: unknown): value is DesignResult {
  const record = readUnknownRecord(value);

  if (!record) {
    return false;
  }

  const kind = readString(record.get("kind"));

  return (
    readString(record.get("id")) !== undefined &&
    (kind === "image" || kind === "video") &&
    readString(record.get("prompt")) !== undefined &&
    readString(record.get("model")) !== undefined &&
    readString(record.get("createdAt")) !== undefined
  );
}

function readRaw(): DesignResult[] {
  if (typeof localStorage === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isDesignResult);
  } catch {
    return [];
  }
}

function writeRaw(results: DesignResult[]): void {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(results.slice(0, MAX_RESULTS))
  );
}

export function listDesignResults(): DesignResult[] {
  return readRaw();
}

export function addDesignResult(result: DesignResult): DesignResult[] {
  const next = [result, ...readRaw()].slice(0, MAX_RESULTS);
  writeRaw(next);

  return next;
}

export function clearDesignResults(): void {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}
