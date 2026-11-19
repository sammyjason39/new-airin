import { describe, expect, test } from "bun:test";
import { AirinApiError } from "@airin/core";
import { TapinallCatalogService } from "./tapinall-catalog";

describe("TapinallCatalogService", () => {
  test("search rejects empty queries", async () => {
    const service = new TapinallCatalogService(null, async () => []);

    await expect(service.search("   ")).rejects.toBeInstanceOf(AirinApiError);
  });

  test("status reports not configured without token or MCP", async () => {
    const previous = process.env.TAPINALL_TOKEN;
    delete process.env.TAPINALL_TOKEN;

    try {
      const service = new TapinallCatalogService(null, async () => []);
      const status = await service.status();

      expect(status.configured).toBe(false);
      expect(status.mcpServerId).toBeNull();
    } finally {
      if (previous === undefined) {
        delete process.env.TAPINALL_TOKEN;
      } else {
        process.env.TAPINALL_TOKEN = previous;
      }
    }
  });

  test("status uses TAPINALL_TOKEN env when MCP is absent", async () => {
    const previous = process.env.TAPINALL_TOKEN;
    const previousFetch = globalThis.fetch;
    process.env.TAPINALL_TOKEN = "tap_test_token";

    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({ availableMicro: "1000000", balanceMicro: "1000000" }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      )) as typeof fetch;

    try {
      const service = new TapinallCatalogService(null, async () => []);
      const status = await service.status();

      expect(status.configured).toBe(true);
      expect(status.availableMicro).toBe("1000000");
    } finally {
      globalThis.fetch = previousFetch;

      if (previous === undefined) {
        delete process.env.TAPINALL_TOKEN;
      } else {
        process.env.TAPINALL_TOKEN = previous;
      }
    }
  });
});
