import { describe, expect, test } from "bun:test";
import {
  appendDesignLocalSources,
  isDesignSourceMediaType,
  MAX_DESIGN_LOCAL_FILES,
  parseSourceUrls,
} from "./design-page-helpers";

describe("design page helpers", () => {
  test("parseSourceUrls splits and trims urls", () => {
    expect(
      parseSourceUrls(" https://a.test/x.png ,\nhttps://b.test/y.jpg ")
    ).toEqual(["https://a.test/x.png", "https://b.test/y.jpg"]);
  });

  test("isDesignSourceMediaType accepts image and video only", () => {
    expect(isDesignSourceMediaType("image/png")).toBe(true);
    expect(isDesignSourceMediaType("video/mp4")).toBe(true);
    expect(isDesignSourceMediaType("application/pdf")).toBe(false);
  });

  test("appendDesignLocalSources rejects oversized batches", () => {
    const files = Array.from(
      { length: MAX_DESIGN_LOCAL_FILES + 1 },
      (_, index) =>
        new File([`pixel-${index}`], `shot-${index}.png`, { type: "image/png" })
    );

    const first = appendDesignLocalSources(
      [],
      files.slice(0, MAX_DESIGN_LOCAL_FILES)
    );

    expect(first.error).toBeNull();
    expect(first.sources).toHaveLength(MAX_DESIGN_LOCAL_FILES);

    const last = files.at(-1);

    expect(last).toBeDefined();

    const overflow = appendDesignLocalSources(
      first.sources,
      last ? [last] : []
    );

    expect(overflow.error).toContain("up to");
    expect(overflow.sources).toHaveLength(MAX_DESIGN_LOCAL_FILES);

    for (const source of first.sources) {
      URL.revokeObjectURL(source.previewUrl);
    }
  });
});
