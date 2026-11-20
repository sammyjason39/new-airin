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

const MAX_SOURCE_FILES = 4;

const MAX_SOURCE_FILE_BYTES = Math.floor(1.5 * 1024 * 1024);

const GENERATE_DEADLINE_MS = 180_000;

const UPLOAD_DEADLINE_MS = 60_000;

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

export type DesignSourceFileInput = {
  data: string;
  filename: string;
  mediaType: string;
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
  sourceFiles?: DesignSourceFileInput[];
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

function readUploadTarget<Value>(
  raw: Value
): { mediaId: string; uploadUrl: string } | null {
  const record = readUnknownRecord(raw);

  if (!record) {
    return null;
  }

  const uploadUrl =
    readString(record.get("upload_url")) ?? readString(record.get("uploadUrl"));

  const mediaId =
    readString(record.get("media_id")) ?? readString(record.get("id"));

  if (uploadUrl && mediaId && /^https:\/\//i.test(uploadUrl)) {
    return { mediaId, uploadUrl };
  }

  for (const key of ["files", "uploads", "data", "result"]) {
    const nested = record.get(key);

    if (Array.isArray(nested)) {
      for (const item of nested) {
        const found = readUploadTarget(item);

        if (found) {
          return found;
        }
      }
    } else if (nested != null) {
      const found = readUploadTarget(nested);

      if (found) {
        return found;
      }
    }
  }

  return null;
}

function decodeSourceFileBytes(file: DesignSourceFileInput): Buffer {
  const trimmed = file.data.trim();
  const dataUrl = trimmed.match(/^data:([^;]+);base64,(.+)$/s);
  const base64 = dataUrl ? dataUrl[2] : trimmed;
  const mediaType = dataUrl?.[1]?.trim() || file.mediaType.trim();

  if (!(mediaType.startsWith("image/") || mediaType.startsWith("video/"))) {
    throw new AirinApiError("Source files must be images or videos.", 400);
  }

  let bytes: Buffer;

  try {
    bytes = Buffer.from(base64 ?? "", "base64");
  } catch {
    throw new AirinApiError("Source file data must be valid base64.", 400);
  }

  if (bytes.byteLength === 0) {
    throw new AirinApiError("Source file is empty.", 400);
  }

  if (bytes.byteLength > MAX_SOURCE_FILE_BYTES) {
    throw new AirinApiError("Each source file must be 1.5 MB or smaller.", 400);
  }

  return bytes;
}

function mediaConfirmType(mediaType: string): "image" | "video" {
  return mediaType.startsWith("video/") ? "video" : "image";
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

  private async uploadLocalSourceFile(
    server: StoredMcpServerRecord,
    orgId: string,
    profileId: string,
    file: DesignSourceFileInput
  ): Promise<string> {
    const filename = file.filename.trim() || "source.bin";
    const mediaType = file.mediaType.trim();
    const bytes = decodeSourceFileBytes(file);

    const prepared = await this.mcpService.callTool(
      server,
      "media_upload",
      {
        content_type: mediaType,
        filename,
        method: "upload_url",
      },
      orgId,
      profileId
    );

    const target = readUploadTarget(prepared);

    if (!target) {
      throw new AirinApiError(
        "Higgsfield did not return an upload URL for the source file.",
        502
      );
    }

    const uploaded = await Promise.race([
      fetch(target.uploadUrl, {
        body: bytes,
        headers: { "Content-Type": mediaType },
        method: "PUT",
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new AirinApiError(
              "Source file upload to Higgsfield timed out.",
              504
            )
          );
        }, UPLOAD_DEADLINE_MS);
      }),
    ]);

    if (!uploaded.ok) {
      throw new AirinApiError(
        "Higgsfield rejected the source file upload.",
        502
      );
    }

    await this.mcpService.callTool(
      server,
      "media_confirm",
      {
        media_id: target.mediaId,
        type: mediaConfirmType(mediaType),
      },
      orgId,
      profileId
    );

    return target.mediaId;
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

    const sourceFiles = (input.sourceFiles ?? []).slice(0, MAX_SOURCE_FILES);

    if (sourceMediaUrls.length + sourceFiles.length > MAX_SOURCE_URLS) {
      throw new AirinApiError(
        `Attach at most ${MAX_SOURCE_URLS} source files and URLs total.`,
        400
      );
    }

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
    const mediaRole = input.kind === "video" ? "start_image" : "image";

    for (const file of sourceFiles) {
      const mediaId = await this.uploadLocalSourceFile(
        server,
        orgId,
        profileId,
        file
      );

      medias.push({ role: mediaRole, value: mediaId });
    }

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
        role: mediaRole,
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
