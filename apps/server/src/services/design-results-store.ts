import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getOrgConfigDir } from "@airin/core";
import {
  isNodeEnoent,
  readString,
  readUnknownRecord,
} from "./design-higgsfield-parse";
import {
  type DesignResultRecord,
  MAX_RESULTS,
  RESULTS_FILE,
} from "./design-types";

function isDesignResultRecord(value: unknown): value is DesignResultRecord {
  const record = readUnknownRecord(value);

  if (!record) {
    return false;
  }

  return (
    readString(record.get("id")) !== undefined &&
    readString(record.get("prompt")) !== undefined
  );
}

function designDir(orgId: string): string {
  return join(getOrgConfigDir(orgId), "design");
}

export async function readResults(
  orgId: string
): Promise<DesignResultRecord[]> {
  try {
    const raw = await readFile(join(designDir(orgId), RESULTS_FILE), "utf8");
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isDesignResultRecord);
  } catch (error) {
    if (isNodeEnoent(error)) {
      return [];
    }

    throw error;
  }
}

export async function writeResults(
  orgId: string,
  results: DesignResultRecord[]
): Promise<void> {
  const dir = designDir(orgId);
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, RESULTS_FILE),
    `${JSON.stringify(results.slice(0, MAX_RESULTS), null, 2)}\n`,
    "utf8"
  );
}
