import { AirinApiError, type JsonValue } from "@airin/core";
import type { DatabaseAdapter, StoredMcpServerRecord } from "@airin/db";
import {
  decodeSourceFileBytes,
  extractCost,
  extractJobId,
  extractResultUrl,
  isHiggsfieldServer,
  isTerminalFailure,
  isTerminalSuccess,
  mediaConfirmType,
  normalizeStatus,
  readMediaId,
  readPollAfterMs,
  readToolStatus,
  readUploadTarget,
} from "./design-higgsfield-parse";
import { readResults, writeResults } from "./design-results-store";
import {
  type DesignEstimate,
  type DesignGenerateInput,
  type DesignResultRecord,
  type DesignSourceFileInput,
  type DesignStatus,
  GENERATE_DEADLINE_MS,
  MAX_PENDING_REFRESH,
  MAX_PROMPT_CHARS,
  MAX_SOURCE_FILES,
  MAX_SOURCE_URLS,
  UPLOAD_DEADLINE_MS,
} from "./design-types";
import type { McpToolArguments } from "./mcp-client-manager";
import type { McpService } from "./mcp-service";

export type {
  DesignEstimate,
  DesignGenerateInput,
  DesignOutputKind,
  DesignResultRecord,
  DesignSourceFileInput,
  DesignStatus,
} from "./design-types";

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
    const results = await readResults(orgId);
    const pending = results
      .filter(
        (item) =>
          !item.resultUrl &&
          Boolean(item.jobId?.trim()) &&
          !isTerminalFailure(normalizeStatus(item.status))
      )
      .slice(0, MAX_PENDING_REFRESH);

    if (pending.length === 0) {
      return results;
    }

    let server: StoredMcpServerRecord;
    let profileId: string;

    try {
      server = await this.resolveHiggsfieldServer();
      profileId = await this.resolveProfileId(orgId);
    } catch {
      return results;
    }

    let changed = false;
    const next = [...results];

    await Promise.all(
      pending.map(async (item) => {
        const jobId = item.jobId?.trim();

        if (!jobId) {
          return;
        }

        try {
          const polled = await this.mcpService.callTool(
            server,
            "job_status",
            { jobId, sync: false },
            orgId,
            profileId
          );

          const resultUrl = extractResultUrl(polled);
          const status = readToolStatus(polled) ?? item.status ?? null;
          const index = next.findIndex((row) => row.id === item.id);

          if (index < 0) {
            return;
          }

          if (!resultUrl && status === item.status) {
            return;
          }

          next[index] = {
            ...next[index]!,
            jobId,
            raw: polled,
            resultUrl: resultUrl ?? next[index]!.resultUrl ?? null,
            status,
          };
          changed = true;
        } catch {
          // Keep the stored row when Higgsfield is briefly unreachable.
        }
      })
    );

    if (changed) {
      await writeResults(orgId, next);
    }

    return next;
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

  private async sleep(ms: number): Promise<void> {
    if (ms <= 0) {
      return;
    }

    await new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private async awaitJobResult(
    server: StoredMcpServerRecord,
    orgId: string,
    profileId: string,
    jobId: string,
    initial: {
      raw: JsonValue;
      resultUrl: string | null;
      status: string | null;
    },
    deadlineAt: number
  ): Promise<{
    raw: JsonValue;
    resultUrl: string | null;
    status: string | null;
  }> {
    let raw = initial.raw;
    let resultUrl = initial.resultUrl;
    let status = normalizeStatus(initial.status);

    if (resultUrl || isTerminalFailure(status)) {
      return { raw, resultUrl, status };
    }

    while (Date.now() < deadlineAt) {
      const remainingMs = deadlineAt - Date.now();

      if (remainingMs <= 0) {
        break;
      }

      const polled = await this.mcpService.callTool(
        server,
        "job_status",
        {
          jobId,
          sync: remainingMs >= 5000,
        },
        orgId,
        profileId
      );

      raw = polled;
      resultUrl = extractResultUrl(polled) ?? resultUrl;
      status = readToolStatus(polled) ?? status;

      if (resultUrl || isTerminalFailure(status)) {
        return { raw, resultUrl, status };
      }

      if (isTerminalSuccess(status)) {
        // Terminal without a URL — stop; a later Results refresh can retry.
        return { raw, resultUrl, status };
      }

      const waitMs = Math.min(
        readPollAfterMs(polled),
        Math.max(0, deadlineAt - Date.now())
      );

      await this.sleep(waitMs);
    }

    try {
      const polled = await this.mcpService.callTool(
        server,
        "job_status",
        { jobId, sync: false },
        orgId,
        profileId
      );

      return {
        raw: polled,
        resultUrl: extractResultUrl(polled) ?? resultUrl,
        status: readToolStatus(polled) ?? status,
      };
    } catch {
      return { raw, resultUrl, status };
    }
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
    const deadlineAt = Date.now() + GENERATE_DEADLINE_MS;

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
        setTimeout(
          () => {
            reject(
              new AirinApiError(
                "Higgsfield generation timed out. Try again.",
                504
              )
            );
          },
          Math.max(1000, deadlineAt - Date.now())
        );
      }),
    ]);

    const jobId = extractJobId(raw);
    const settled = jobId
      ? await this.awaitJobResult(
          server,
          orgId,
          profileId,
          jobId,
          {
            raw,
            resultUrl: extractResultUrl(raw),
            status: readToolStatus(raw),
          },
          deadlineAt
        )
      : {
          raw,
          resultUrl: extractResultUrl(raw),
          status: readToolStatus(raw),
        };

    const result: DesignResultRecord = {
      cost: extractCost(settled.raw) ?? extractCost(raw),
      createdAt: new Date().toISOString(),
      id: jobId ?? `design_${Date.now()}`,
      jobId,
      kind: input.kind,
      model,
      prompt,
      raw: settled.raw,
      resultUrl: settled.resultUrl,
      status: settled.status,
    };

    const existing = await readResults(orgId);
    await writeResults(orgId, [result, ...existing]);

    return { result };
  }
}
