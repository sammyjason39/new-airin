import { describe, expect, test } from "bun:test";
import { resolveAirinDokuConfig } from "./doku-env";

describe("resolveAirinDokuConfig", () => {
  test("returns null while Doku checkout is hidden", () => {
    expect(
      resolveAirinDokuConfig({
        AIRIN_DOKU_CLIENT_ID: "client",
        AIRIN_DOKU_SECRET_KEY: "secret",
      })
    ).toBeNull();
  });
});
