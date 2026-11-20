import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { AirinApiError, getOrgConfigDir, type JsonValue } from "@airin/core";
import type { DatabaseAdapter, StoredMcpServerRecord } from "@airin/db";
import type { McpToolArguments } from "./mcp-client-manager";
import type { McpService } from "./mcp-service";

const RESULTS_FILE = "results.json";

const MAX_RESULTS = 100;

const MAX_PROMPT_CHARS = 16_000;

const MAX_SOURCE_URLS = 8;

const GENERATE_DEADLINE_MS = 180_000;

export type DesignOutputKind = "image" | "video";

export type DesignEstimate = JsonValue;

export type DesignResultRecord = {
  id: string;
  kind: DesignOutputKind;
  model: string;
  prompt: string;
  createdAt: string;
  cost?: number | string | null;
  jobId?: string | null;
  resultUrl?: string | null;
  status?: string | null;
  raw?: JsonValue;
};

export type DesignGenerateInput = {
  aspectRatio?: string;
  count?: number;
  duration?: number;
  estimateOnly?: boolean;
  kind: DesignOutputKind;
  model: string;
  params?: McpToolArguments;
  profileId?: string;
  prompt: string;
  sourceMediaUrls?: string[];
};

export type DesignStatus = {
  connected: boolean;
  needsAuth: boolean;
  serverId: string | null;
  serverName: string | null;
  toolCount: number;
};

function readUnknownRecord<Value>(
  value: Value
): Map<string, unknown> | undefined {
  if (!(value instanceof Object) || Array.isArray(value)) {
    return;
  }

  return new Map(Object.entries(value));
}

function readString<Value>(value: Value): (Value & string) | undefined {
  // SAFETY: The object tag check confirms the input uses the string representation.
  return Object.prototype.toString.call(value) === "[object String]"
    ? (value as Value & string)
    : undefined;
}

function readNumber<Value>(value: Value): (Value & number) | undefined {
  // SAFETY: The object tag check confirms the input uses the number representation.
  return Object.prototype.toString.call(value) === "[object Number]"
    ? (value as Value & number)
    : undefined;
}

function isNodeEnoent<Value>(error: Value): boolean {
  const record = readUnknownRecord(error);

  return record?.get("code") === "ENOENT";
}

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

function isHiggsfieldServer(server: {
  config?: unknown;
  name: string;
}): boolean {
  if (server.name.trim().toLowerCase() === "higgsfield") {
    return true;
  }

  const config = readUnknownRecord(server.config);

  if (!config) {
    return false;
  }

  const url = readString(config.get("url")) ?? "";

  return /higgsfield\.ai/i.test(url);
}

function designDir(orgId: string): string {
  return join(getOrgConfigDir(orgId), "design");
}

async function readResults(orgId: string): Promise<DesignResultRecord[]> {
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

async function writeResults(
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

function extractResultUrl<Value>(value: Value): string | null {
  const record = readUnknownRecord(value);

  if (!record) {
    return null;
  }

  for (const key of ["result_url", "resultUrl", "url"]) {
    const candidate = readString(record.get(key));

    if (candidate && /^https?:\/\//i.test(candidate)) {
      return candidate;
    }
  }

  const results = record.get("results");

  if (Array.isArray(results)) {
    for (const item of results) {
      const nested = extractResultUrl(item);

      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

function extractJobId<Value>(value: Value): string | null {
  const record = readUnknownRecord(value);

  if (!record) {
    return null;
  }

  return readString(record.get("id")) ?? null;
}

function extractCost<Value>(value: Value): number | string | null {
  const record = readUnknownRecord(value);

  if (!record) {
    return null;
  }

  const cost = record.get("cost");
  const asNumber = readNumber(cost);
  const asString = readString(cost);

  if (asNumber !== undefined) {
    return asNumber;
  }

  if (asString !== undefined) {
    return asString;
  }

  return null;
}

function readMediaId<Value>(imported: Value): string | null {
  const record = readUnknownRecord(imported);

  if (!record) {
    return null;
  }

  return (
    readString(record.get("media_id")) ?? readString(record.get("id")) ?? null
  );
}

function readToolStatus<Value>(raw: Value): string | null {
  const record = readUnknownRecord(raw);

  if (!record) {
    return null;
  }

  const status = record.get("status");
  const asString = readString(status);

  return asString ?? (status == null ? null : String(status));
}

export class DesignService {
  constructor(
    private readonly db: DatabaseAdapter,
    private readonly mcpService: McpService
  ) {}

  async status(): Promise<DesignStatus> {
    const servers = await this.db.listMcpServers();
    const stored = servers.find((item) => isHiggsfieldServer(item));

    if (!stored) {
      return {
        connected: false,
        needsAuth: false,
        serverId: null,
        serverName: null,
        toolCount: 0,
      };
    }

    const { server } = await this.mcpService.getServer(stored.id);

    return {
      connected: server.enabled && server.status === "connected",
      needsAuth: server.status === "needs_auth",
      serverId: server.id,
      serverName: server.name,
      toolCount: server.toolCount ?? 0,
    };
  }

  async listResults(orgId: string): Promise<DesignResultRecord[]> {
    return readResults(orgId);
  }

  async resolveHiggsfieldServer(): Promise<StoredMcpServerRecord> {
    const servers = await this.db.listMcpServers();
    const server = servers.find((item) => isHiggsfieldServer(item));

    if (!server) {
      throw new AirinApiError(
        "Connect Higgsfield MCP first: Settings → MCP → add https://mcp.higgsfield.ai/mcp",
        400
      );
    }

    if (server.status === "needs_auth") {
      throw new AirinApiError(
        "Higgsfield MCP needs sign-in. Open Settings → MCP and approve it.",
        401
      );
    }

    if (!server.enabled) {
      throw new AirinApiError("Higgsfield MCP is disabled.", 400);
    }

    return server;
  }

  private async resolveProfileId(
    orgId: string,
    preferred?: string
  ): Promise<string> {
    if (preferred?.trim()) {
      const profile = await this.db.getProfile(preferred.trim());

      if (!profile || profile.orgId !== orgId) {
        throw new AirinApiError("Profile not found in this organization.", 404);
      }

      return profile.id;
    }

    const profiles = (await this.db.listProfiles()).filter(
      (profile) => profile.orgId === orgId
    );

    const first = profiles[0];

    if (!first) {
      throw new AirinApiError(
        "Create an agent profile before using Design.",
        400
      );
    }

    return first.id;
  }

  async generate(
    orgId: string,
    input: DesignGenerateInput
  ): Promise<{
    estimate?: DesignEstimate;
    result?: DesignResultRecord;
  }> {
    const prompt = input.prompt.trim();

    if (!prompt) {
      throw new AirinApiError("Prompt is required.", 400);
    }

    if (prompt.length > MAX_PROMPT_CHARS) {
      throw new AirinApiError("Prompt is too long.", 400);
    }

    const model = input.model.trim();

    if (!model) {
      throw new AirinApiError("Model is required.", 400);
    }

    const sourceMediaUrls = (input.sourceMediaUrls ?? [])
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, MAX_SOURCE_URLS);

    for (const url of sourceMediaUrls) {
      if (!/^https:\/\//i.test(url)) {
        throw new AirinApiError(
          "Source media URLs must be https:// links.",
          400
        );
      }
    }

    const server = await this.resolveHiggsfieldServer();
    const profileId = await this.resolveProfileId(orgId, input.profileId);
    const medias: Array<{ role: string; value: string }> = [];

    for (const url of sourceMediaUrls) {
      const imported = await this.mcpService.callTool(
        server,
        "media_import_url",
        { url },
        orgId,
        profileId
      );

      const mediaId = readMediaId(imported);

      if (!mediaId) {
        throw new AirinApiError(
          "Higgsfield did not return a media id for a source URL.",
          502
        );
      }

      medias.push({
        role: input.kind === "video" ? "start_image" : "image",
        value: mediaId,
      });
    }

    const params = {
      ...(input.params ?? {}),
      count: Math.min(Math.max(input.count ?? 1, 1), 4),
      model,
      prompt,
    } satisfies McpToolArguments;

    if (input.aspectRatio?.trim()) {
      params.aspect_ratio = input.aspectRatio.trim();
    }

    if (input.kind === "video" && input.duration != null) {
      params.duration = input.duration;
    }

    if (medias.length > 0) {
      params.medias = medias;
    }

    if (input.estimateOnly) {
      const tool =
        input.kind === "video" ? "estimate_video_cost" : "estimate_image_cost";

      const estimate = await this.mcpService.callTool(
        server,
        tool,
        { params },
        orgId,
        profileId
      );

      return { estimate };
    }

    const tool = input.kind === "video" ? "generate_video" : "generate_image";

    const raw = await Promise.race([
      this.mcpService.callTool(
        server,
        tool,
        {
          context: "Airin Design page generation",
          params,
        },
        orgId,
        profileId
      ),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new AirinApiError(
              "Higgsfield generation timed out. Try again.",
              504
            )
          );
        }, GENERATE_DEADLINE_MS);
      }),
    ]);

    const result: DesignResultRecord = {
      cost: extractCost(raw),
      createdAt: new Date().toISOString(),
      id: extractJobId(raw) ?? `design_${Date.now()}`,
      jobId: extractJobId(raw),
      kind: input.kind,
      model,
      prompt,
      raw,
      resultUrl: extractResultUrl(raw),
      status: readToolStatus(raw),
    };

    const existing = await readResults(orgId);
    await writeResults(orgId, [result, ...existing]);

    return { result };
  }
}
