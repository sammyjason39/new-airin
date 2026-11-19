import { describe, expect, test } from "bun:test";
import {
  isRequiredGoogleToolkitSlug,
  REQUIRED_GOOGLE_TOOLKIT_SLUGS,
  REQUIRED_GOOGLE_TOOLKIT_TITLES,
} from "./required-google-toolkits";

describe("required Google toolkits", () => {
  test("covers Gmail, Drive, and Sheets", () => {
    expect([...REQUIRED_GOOGLE_TOOLKIT_SLUGS]).toEqual([
      "gmail",
      "googledrive",
      "googlesheets",
    ]);
    expect(REQUIRED_GOOGLE_TOOLKIT_TITLES.gmail).toBe("Connect Gmail");
  });

  test("matches slugs case-insensitively", () => {
    expect(isRequiredGoogleToolkitSlug("Gmail")).toBe(true);
    expect(isRequiredGoogleToolkitSlug("metaads")).toBe(false);
  });
});
