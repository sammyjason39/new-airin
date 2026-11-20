import { describe, expect, test } from "bun:test";
import { defaultModelId, getDesignModel, listDesignModels } from "./models";

describe("design models", () => {
  test("lists image and video catalog entries", () => {
    expect(listDesignModels("image").length).toBeGreaterThan(0);
    expect(listDesignModels("video").length).toBeGreaterThan(0);
  });

  test("prefers nano_banana for image defaults", () => {
    expect(defaultModelId("image")).toBe("nano_banana");
    expect(getDesignModel("nano_banana")?.outputType).toBe("image");
  });

  test("prefers seedance_2_0_mini for video defaults", () => {
    expect(defaultModelId("video")).toBe("seedance_2_0_mini");
  });
});
