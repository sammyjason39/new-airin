import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DesignService } from "./design-service";

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
    const calls: Array<{ name: string; input: unknown }> = [];
    const mcpService = {
      async callTool(
        _server: unknown,
        name: string,
        input: unknown
      ): Promise<unknown> {
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

    const service = new DesignService(db as never, mcpService as never);
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

  test("generate stores a result after image generation", async () => {
    const mcpService = {
      async callTool(_server: unknown, name: string): Promise<unknown> {
        if (name === "generate_image") {
          return {
            cost: 1,
            id: "job_1",
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

    const service = new DesignService(db as never, mcpService as never);
    const output = await service.generate("org_1", {
      kind: "image",
      model: "nano_banana",
      prompt: "A blue mug",
    });

    expect(output.result?.id).toBe("job_1");
    expect(output.result?.resultUrl).toBe("https://cdn.higgsfield.ai/out.png");

    const stored = await service.listResults("org_1");
    expect(stored).toHaveLength(1);
    expect(stored[0]?.resultUrl).toBe("https://cdn.higgsfield.ai/out.png");
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

    const service = new DesignService(db as never, mcpService as never);
    await expect(service.status()).resolves.toEqual({
      connected: true,
      needsAuth: false,
      serverId: "mcp_hf",
      serverName: "Higgsfield",
      toolCount: 12,
    });
  });
});
