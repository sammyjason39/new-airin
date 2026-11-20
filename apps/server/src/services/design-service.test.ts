import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { JsonValue } from "@airin/core";
import type { DatabaseAdapter, StoredMcpServerRecord } from "@airin/db";
import { DesignService } from "./design-service";
import type { McpToolArguments } from "./mcp-client-manager";
import type { McpService } from "./mcp-service";

describe("DesignService results store", () => {
  let configDir = "";
  let previousConfigDir: string | undefined;

  beforeEach(async () => {
    previousConfigDir = process.env.AIRIN_CONFIG_DIR;
    configDir = await mkdtemp(join(tmpdir(), "airin-design-"));
    process.env.AIRIN_CONFIG_DIR = configDir;
  });

  afterEach(async () => {
    if (previousConfigDir === undefined) {
      delete process.env.AIRIN_CONFIG_DIR;
    } else {
      process.env.AIRIN_CONFIG_DIR = previousConfigDir;
    }

    await rm(configDir, { force: true, recursive: true });
  });

  test("generate estimateOnly returns cost without writing results", async () => {
    const calls: Array<{ input: McpToolArguments; name: string }> = [];

    const mcpService = {
      async callTool(
        _server: StoredMcpServerRecord,
        name: string,
        input: McpToolArguments
      ): Promise<JsonValue> {
        calls.push({ input, name });

        return { cost: 1 };
      },
      async getServer() {
        return {
          server: {
            enabled: true,
            id: "mcp_hf",
            name: "Higgsfield",
            status: "connected",
            toolCount: 3,
          },
        };
      },
      async listServers() {
        return { servers: [] };
      },
    };

    const db = {
      async getProfile() {
        return null;
      },
      async listMcpServers() {
        return [
          {
            config: { url: "https://mcp.higgsfield.ai/mcp" },
            enabled: true,
            id: "mcp_hf",
            name: "Higgsfield",
            status: "connected",
          },
        ];
      },
      async listProfiles() {
        return [{ id: "profile_1", orgId: "org_1" }];
      },
    };

    // SAFETY: This mock implements only the database methods DesignService calls in this test.
    const service = new DesignService(
      db as DatabaseAdapter,
      mcpService as McpService
    );

    const output = await service.generate("org_1", {
      estimateOnly: true,
      kind: "image",
      model: "nano_banana",
      prompt: "A red mug on a white table",
    });

    expect(output.estimate).toEqual({ cost: 1 });
    expect(output.result).toBeUndefined();
    expect(calls.map((item) => item.name)).toEqual(["estimate_image_cost"]);

    await expect(
      readFile(
        join(configDir, "orgs", "org_1", "design", "results.json"),
        "utf8"
      )
    ).rejects.toMatchObject({ code: "ENOENT" });
  });

  test("generate uploads local source files before image generation", async () => {
    const calls: string[] = [];
    const originalFetch = globalThis.fetch;

    // SAFETY: Test double matches fetch's call signature for the PUT path under test.
    globalThis.fetch = (async (input, init) => {
      expect(String(input)).toBe("https://upload.higgsfield.ai/put");
      expect(init?.method).toBe("PUT");

      return new Response(null, { status: 200 });
    }) as typeof fetch;

    try {
      const mcpService = {
        async callTool(
          _server: StoredMcpServerRecord,
          name: string,
          input: McpToolArguments
        ): Promise<JsonValue> {
          calls.push(name);

          if (name === "media_upload") {
            expect(input.filename).toBe("mug.png");

            return {
              media_id: "media_local_1",
              upload_url: "https://upload.higgsfield.ai/put",
            };
          }

          if (name === "media_confirm") {
            expect(input.media_id).toBe("media_local_1");
            expect(input.type).toBe("image");

            return { ok: true };
          }

          if (name === "generate_image") {
            expect(input).toMatchObject({
              params: {
                medias: [{ role: "image", value: "media_local_1" }],
              },
            });

            return {
              cost: 1,
              id: "job_local",
              result_url: "https://cdn.higgsfield.ai/local.png",
              status: "succeeded",
            };
          }

          throw new Error(`unexpected tool ${name}`);
        },
        async getServer() {
          return {
            server: {
              enabled: true,
              id: "mcp_hf",
              name: "Higgsfield",
              status: "connected",
              toolCount: 3,
            },
          };
        },
        async listServers() {
          return { servers: [] };
        },
      };

      const db = {
        async getProfile() {
          return null;
        },
        async listMcpServers() {
          return [
            {
              config: { url: "https://mcp.higgsfield.ai/mcp" },
              enabled: true,
              id: "mcp_hf",
              name: "Higgsfield",
              status: "connected",
            },
          ];
        },
        async listProfiles() {
          return [{ id: "profile_1", orgId: "org_1" }];
        },
      };

      // SAFETY: This mock implements only the database methods DesignService calls in this test.
      const service = new DesignService(
        db as DatabaseAdapter,
        mcpService as McpService
      );

      const output = await service.generate("org_1", {
        kind: "image",
        model: "nano_banana",
        prompt: "Product shot",
        sourceFiles: [
          {
            data: Buffer.from("fake-png").toString("base64"),
            filename: "mug.png",
            mediaType: "image/png",
          },
        ],
      });

      expect(output.result?.id).toBe("job_local");
      expect(calls).toEqual([
        "media_upload",
        "media_confirm",
        "generate_image",
      ]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("generate stores a result after image generation", async () => {
    const mcpService = {
      async callTool(
        _server: StoredMcpServerRecord,
        name: string
      ): Promise<JsonValue> {
        if (name === "generate_image") {
          return {
            cost: 1,
            id: "job_ready_1",
            result_url: "https://cdn.higgsfield.ai/out.png",
            status: "succeeded",
          };
        }

        throw new Error(`unexpected tool ${name}`);
      },
      async getServer() {
        return {
          server: {
            enabled: true,
            id: "mcp_hf",
            name: "Higgsfield",
            status: "connected",
            toolCount: 3,
          },
        };
      },
      async listServers() {
        return { servers: [] };
      },
    };

    const db = {
      async getProfile() {
        return null;
      },
      async listMcpServers() {
        return [
          {
            config: { url: "https://mcp.higgsfield.ai/mcp" },
            enabled: true,
            id: "mcp_hf",
            name: "Higgsfield",
            status: "connected",
          },
        ];
      },
      async listProfiles() {
        return [{ id: "profile_1", orgId: "org_1" }];
      },
    };

    // SAFETY: This mock implements only the database methods DesignService calls in this test.
    const service = new DesignService(
      db as DatabaseAdapter,
      mcpService as McpService
    );

    const output = await service.generate("org_1", {
      kind: "image",
      model: "nano_banana",
      prompt: "A blue mug",
    });

    expect(output.result?.id).toBe("job_ready_1");
    expect(output.result?.resultUrl).toBe("https://cdn.higgsfield.ai/out.png");

    const stored = await service.listResults("org_1");
    expect(stored).toHaveLength(1);
    expect(stored[0]?.resultUrl).toBe("https://cdn.higgsfield.ai/out.png");
  });

  test("generate polls job_status when Higgsfield returns pending without a URL", async () => {
    const jobId = "11111111-1111-4111-a111-111111111111";
    const calls: string[] = [];

    const mcpService = {
      async callTool(
        _server: StoredMcpServerRecord,
        name: string,
        input: McpToolArguments
      ): Promise<JsonValue> {
        calls.push(name);

        if (name === "generate_image") {
          return {
            results: [
              {
                id: jobId,
                status: "pending",
              },
            ],
          };
        }

        if (name === "job_status") {
          expect(input.jobId).toBe(jobId);

          // Matches the MCP content wrapper Airin stores for Higgsfield tools.
          return {
            content: [
              {
                mimeType: "image/png",
                name: "ready.png",
                type: "resource_link",
                uri: "https://cdn.higgsfield.ai/ready.png",
              },
            ],
            text: `Job ${jobId} — completed\nhttps://cdn.higgsfield.ai/ready.png`,
          };
        }

        throw new Error(`unexpected tool ${name}`);
      },
      async getServer() {
        return {
          server: {
            enabled: true,
            id: "mcp_hf",
            name: "Higgsfield",
            status: "connected",
            toolCount: 3,
          },
        };
      },
      async listServers() {
        return { servers: [] };
      },
    };

    const db = {
      async getProfile() {
        return null;
      },
      async listMcpServers() {
        return [
          {
            config: { url: "https://mcp.higgsfield.ai/mcp" },
            enabled: true,
            id: "mcp_hf",
            name: "Higgsfield",
            status: "connected",
          },
        ];
      },
      async listProfiles() {
        return [{ id: "profile_1", orgId: "org_1" }];
      },
    };

    // SAFETY: This mock implements only the database methods DesignService calls in this test.
    const service = new DesignService(
      db as DatabaseAdapter,
      mcpService as McpService
    );

    const output = await service.generate("org_1", {
      kind: "image",
      model: "nano_banana",
      prompt: "Pending then ready",
    });

    expect(output.result?.id).toBe(jobId);
    expect(output.result?.jobId).toBe(jobId);
    expect(output.result?.resultUrl).toBe(
      "https://cdn.higgsfield.ai/ready.png"
    );
    expect(output.result?.status).toBe("completed");
    expect(calls).toEqual(["generate_image", "job_status"]);
  });

  test("listResults refreshes a stored pending job without a preview URL", async () => {
    const jobId = "22222222-2222-4222-a222-222222222222";

    await mkdir(join(configDir, "orgs", "org_1", "design"), {
      recursive: true,
    });
    await writeFile(
      join(configDir, "orgs", "org_1", "design", "results.json"),
      `${JSON.stringify(
        [
          {
            createdAt: "2026-01-01T00:00:00.000Z",
            id: jobId,
            jobId,
            kind: "image",
            model: "nano_banana",
            prompt: "Old pending",
            resultUrl: null,
            status: "pending",
          },
        ],
        null,
        2
      )}\n`
    );

    const mcpService = {
      async callTool(
        _server: StoredMcpServerRecord,
        name: string,
        input: McpToolArguments
      ): Promise<JsonValue> {
        expect(name).toBe("job_status");
        expect(input.jobId).toBe(jobId);
        expect(input.sync).toBe(false);

        return {
          id: jobId,
          result_url: "https://cdn.higgsfield.ai/refreshed.png",
          status: "completed",
        };
      },
      async getServer() {
        return {
          server: {
            enabled: true,
            id: "mcp_hf",
            name: "Higgsfield",
            status: "connected",
            toolCount: 3,
          },
        };
      },
      async listServers() {
        return { servers: [] };
      },
    };

    const db = {
      async getProfile() {
        return null;
      },
      async listMcpServers() {
        return [
          {
            config: { url: "https://mcp.higgsfield.ai/mcp" },
            enabled: true,
            id: "mcp_hf",
            name: "Higgsfield",
            status: "connected",
          },
        ];
      },
      async listProfiles() {
        return [{ id: "profile_1", orgId: "org_1" }];
      },
    };

    // SAFETY: This mock implements only the database methods DesignService calls in this test.
    const service = new DesignService(
      db as DatabaseAdapter,
      mcpService as McpService
    );

    const stored = await service.listResults("org_1");

    expect(stored).toHaveLength(1);
    expect(stored[0]?.resultUrl).toBe(
      "https://cdn.higgsfield.ai/refreshed.png"
    );
    expect(stored[0]?.status).toBe("completed");
  });

  test("status reports a connected Higgsfield server", async () => {
    const mcpService = {
      async callTool() {
        return {};
      },
      async getServer() {
        return {
          server: {
            enabled: true,
            id: "mcp_hf",
            name: "Higgsfield",
            status: "connected",
            toolCount: 12,
          },
        };
      },
      async listServers() {
        return { servers: [] };
      },
    };

    const db = {
      async getProfile() {
        return null;
      },
      async listMcpServers() {
        return [
          {
            config: { url: "https://mcp.higgsfield.ai/mcp" },
            enabled: true,
            id: "mcp_hf",
            name: "Higgsfield",
            status: "connected",
          },
        ];
      },
      async listProfiles() {
        return [];
      },
    };

    // SAFETY: This mock implements only the database methods DesignService calls in this test.
    const service = new DesignService(
      db as DatabaseAdapter,
      mcpService as McpService
    );

    await expect(service.status()).resolves.toEqual({
      connected: true,
      needsAuth: false,
      serverId: "mcp_hf",
      serverName: "Higgsfield",
      toolCount: 12,
    });
  });
});
