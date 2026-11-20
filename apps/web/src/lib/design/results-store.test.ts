import { afterEach, beforeAll, describe, expect, test } from "bun:test";
import {
  addDesignResult,
  clearDesignResults,
  listDesignResults,
} from "./results-store";
import type { DesignResult } from "./types";

beforeAll(() => {
  const memory = new Map<string, string>();

  globalThis.localStorage = {
    clear: () => memory.clear(),
    getItem: (key) => memory.get(key) ?? null,
    key: (index) => [...memory.keys()][index] ?? null,
    get length() {
      return memory.size;
    },
    removeItem: (key) => {
      memory.delete(key);
    },
    setItem: (key, value) => {
      memory.set(key, value);
    },
  };
});

const sample = (id: string): DesignResult => ({
  createdAt: new Date(0).toISOString(),
  id,
  imageUrl: "https://example.com/a.png",
  kind: "image",
  model: "nano_banana",
  prompt: `Prompt ${id}`,
});

afterEach(() => {
  clearDesignResults();
});

describe("design results store", () => {
  test("round-trips saved results", () => {
    addDesignResult(sample("one"));
    const listed = listDesignResults();

    expect(listed).toHaveLength(1);
    expect(listed[0]?.id).toBe("one");
  });

  test("keeps newest results first and caps at 100", () => {
    for (let index = 0; index < 105; index += 1) {
      addDesignResult(sample(`item-${index}`));
    }

    const listed = listDesignResults();
    expect(listed).toHaveLength(100);
    expect(listed[0]?.id).toBe("item-104");
  });
});
