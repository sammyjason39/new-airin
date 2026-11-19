import { AirinApiError } from "@airin/core";
import type { DatabaseAdapter, StoredMcpServerRecord } from "@airin/db";
import { z } from "zod";

const DEFAULT_API_BASE = "https://tapinall.com";

const REQUEST_TIMEOUT_MS = 20_000;

const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;

const MAX_SEARCH_LIMIT = 100;

const StdioEnvSchema = z.object({
  env: z.record(z.string(), z.string()).optional(),
});

const BalanceSchema = z.object({
  availableMicro: z.string().optional(),
  balanceMicro: z.string().optional(),
});

const CategorySchema = z.object({
  indexedToolCount: z.number(),
  label: z.string(),
  platformCount: z.number(),
});

const AppSchema = z.object({
  collectionIds: z.array(z.string()),
  id: z.string(),
  label: z.string(),
});

const CollectionSchema = z.object({
  category: z.string(),
  description: z.string(),
  featured: z.number().nullish(),
  id: z.string(),
  indexedToolCount: z.number(),
  label: z.string(),
  providerIds: z.array(z.string()),
  startingPrice: z
    .object({
      free: z.boolean(),
      priceMicro: z.string(),
      priceUnit: z.string(),
    })
    .nullish(),
});

const BrowseSchema = z.object({
  apps: z.array(AppSchema).default([]),
  categories: z.array(CategorySchema).default([]),
  collections: z.array(CollectionSchema).default([]),
});

const ToolSchema = z.object({
  asyncTask: z.boolean(),
  cached: z.boolean(),
  category: z.string(),
  description: z.string(),
  free: z.boolean(),
  id: z.string(),
  method: z.string(),
  name: z.string(),
  priceMicro: z.string(),
  priceUnit: z.string(),
});

const SearchSchema = z.object({
  tools: z.array(ToolSchema).default([]),
});

const ErrorBodySchema = z.object({
  detail: z.string().optional(),
  message: z.string().optional(),
});

export type TapinallCatalogBrowse = z.infer<typeof BrowseSchema>;

export type TapinallCatalogTool = z.infer<typeof ToolSchema>;

export type TapinallCatalogSearch = z.infer<typeof SearchSchema>;

export type TapinallCatalogStatus = {
  availableMicro: string | null;
  balanceMicro: string | null;
  configured: boolean;
  mcpServerId: string | null;
  mcpStatus: string | null;
};

type TapinallEnvCredentials = {
  apiBase: string | null;
  token: string | null;
};

type TapinallTokenSource = {
  apiBase: string;
  mcpServerId: string | null;
  mcpStatus: string | null;
  token: string;
};

/**
 * Proxies the Tapinall catalog with the install's Tapinall MCP project token.
 * Keeps the token off the browser.
 */
export class TapinallCatalogService {
  constructor(
    private readonly db: DatabaseAdapter | null,
    private readonly listMcpServers: () => Promise<
      Array<Pick<StoredMcpServerRecord, "id" | "name" | "status" | "enabled">>
    >
  ) {}

  async status(): Promise<TapinallCatalogStatus> {
    const source = await this.resolveTokenSource();

    if (!source) {
      return {
        availableMicro: null,
        balanceMicro: null,
        configured: false,
        mcpServerId: null,
        mcpStatus: null,
      };
    }

    try {
      const balance = await this.fetchJson(
        source,
        "/v1/balance",
        BalanceSchema
      );

      return {
        availableMicro: balance.availableMicro ?? balance.balanceMicro ?? null,
        balanceMicro: balance.balanceMicro ?? null,
        configured: true,
        mcpServerId: source.mcpServerId,
        mcpStatus: source.mcpStatus,
      };
    } catch {
      return {
        availableMicro: null,
        balanceMicro: null,
        configured: true,
        mcpServerId: source.mcpServerId,
        mcpStatus: source.mcpStatus,
      };
    }
  }

  async browse(): Promise<TapinallCatalogBrowse> {
    const source = await this.requireTokenSource();

    return this.fetchJson(source, "/v1/catalog/browse", BrowseSchema);
  }

  async search(query: string, limit = 25): Promise<TapinallCatalogSearch> {
    const trimmed = query.trim();

    if (trimmed.length < 1 || trimmed.length > 200) {
      throw new AirinApiError(
        "Enter a search term between 1 and 200 characters.",
        400
      );
    }

    const pageSize = Math.min(
      Math.max(1, Math.floor(limit) || 25),
      MAX_SEARCH_LIMIT
    );

    const source = await this.requireTokenSource();

    const params = new URLSearchParams({
      limit: String(pageSize),
      q: trimmed,
    });

    return this.fetchJson(source, `/v1/catalog/search?${params}`, SearchSchema);
  }

  private async requireTokenSource(): Promise<TapinallTokenSource> {
    const source = await this.resolveTokenSource();

    if (!source) {
      throw new AirinApiError(
        "Tapinall is not connected. Add the Tapinall MCP server first.",
        400
      );
    }

    return source;
  }

  private async resolveTokenSource(): Promise<TapinallTokenSource | null> {
    const envToken = process.env.TAPINALL_TOKEN?.trim();

    const envBase =
      process.env.TAPINALL_API_BASE?.trim().replace(/\/+$/, "") ||
      DEFAULT_API_BASE;

    const servers = await this.listMcpServers();

    const match = servers.find(
      (server) =>
        server.enabled && server.name.trim().toLowerCase() === "tapinall"
    );

    if (match && this.db) {
      const record = await this.db.getMcpServer(match.id);
      const fromConfig = readTapinallEnv(record?.config);

      if (fromConfig.token) {
        return {
          apiBase: fromConfig.apiBase || envBase,
          mcpServerId: match.id,
          mcpStatus: match.status,
          token: fromConfig.token,
        };
      }
    }

    if (envToken) {
      return {
        apiBase: envBase,
        mcpServerId: match?.id ?? null,
        mcpStatus: match?.status ?? null,
        token: envToken,
      };
    }

    return null;
  }

  private async fetchJson<TSchema extends z.ZodType>(
    source: TapinallTokenSource,
    path: string,
    schema: TSchema
  ): Promise<z.infer<TSchema>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${source.apiBase}${path}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${source.token}`,
          "User-Agent": "airin-tapinall-catalog",
        },
        method: "GET",
        signal: controller.signal,
      });

      const raw = await readBodyCapped(response, MAX_RESPONSE_BYTES);

      if (!response.ok) {
        throw new AirinApiError(
          readTapinallErrorMessage(raw) ||
            `Tapinall catalog request failed (${response.status}).`,
          response.status >= 400 && response.status < 600
            ? response.status
            : 502
        );
      }

      return schema.parse(JSON.parse(raw));
    } catch (error) {
      if (error instanceof AirinApiError) {
        throw error;
      }

      if (error instanceof z.ZodError) {
        throw new AirinApiError("Tapinall catalog response was invalid.", 502);
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new AirinApiError("Tapinall catalog request timed out.", 504);
      }

      throw new AirinApiError(
        error instanceof Error
          ? error.message
          : "Tapinall catalog request failed.",
        502
      );
    } finally {
      clearTimeout(timer);
    }
  }
}

function readTapinallEnv(
  config: StoredMcpServerRecord["config"] | undefined
): TapinallEnvCredentials {
  const parsed = StdioEnvSchema.safeParse(config);

  if (!parsed.success) {
    return { apiBase: null, token: null } satisfies TapinallEnvCredentials;
  }

  const token = parsed.data.env?.TAPINALL_TOKEN?.trim() || null;

  const apiBase =
    parsed.data.env?.TAPINALL_API_BASE?.trim().replace(/\/+$/, "") || null;

  return { apiBase, token } satisfies TapinallEnvCredentials;
}

function readTapinallErrorMessage(raw: string): string | null {
  try {
    const parsed = ErrorBodySchema.safeParse(JSON.parse(raw));

    if (!parsed.success) {
      return null;
    }

    if (parsed.data.message?.trim()) {
      return parsed.data.message.trim();
    }

    if (parsed.data.detail?.trim()) {
      return parsed.data.detail.trim();
    }
  } catch {
    // Non-JSON provider errors stay generic above.
  }

  return null;
}

async function readBodyCapped(
  response: Response,
  maxBytes: number
): Promise<string> {
  const lengthHeader = response.headers.get("content-length");

  if (lengthHeader) {
    const length = Number(lengthHeader);

    if (Number.isFinite(length) && length > maxBytes) {
      throw new AirinApiError("Tapinall catalog response is too large.", 502);
    }
  }

  const buffer = await response.arrayBuffer();

  if (buffer.byteLength > maxBytes) {
    throw new AirinApiError("Tapinall catalog response is too large.", 502);
  }

  return new TextDecoder().decode(buffer);
}
