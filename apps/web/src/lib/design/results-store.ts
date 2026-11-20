import type { DesignResult } from "./types";

const STORAGE_KEY = "airin-design-results";
const MAX_RESULTS = 100;

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

    return parsed.filter((entry): entry is DesignResult => {
      if (!entry || typeof entry !== "object") {
        return false;
      }

      const record = entry as DesignResult;
      return (
        typeof record.id === "string" &&
        (record.kind === "image" || record.kind === "video") &&
        typeof record.prompt === "string" &&
        typeof record.model === "string" &&
        typeof record.createdAt === "string"
      );
    });
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
