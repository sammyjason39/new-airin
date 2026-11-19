import { AirinApiError } from "@airin/core";
import { createRoute, z } from "@hono/zod-openapi";
import { TapinallCatalogService } from "../../services/tapinall-catalog";
import type { ServerOptions } from "../context";
import { requireOrgMemberFromContext } from "../org-guards";
import { errorResponse, json } from "../shared";
import type { HonoApp } from "../types";

export function registerTapinallRoutes(
  app: HonoApp,
  options: ServerOptions
): void {
  const service = new TapinallCatalogService(
    options.databaseAdapter ?? null,
    async () => {
      const { servers } = await options.mcpService.listServers();

      return servers.map((server) => ({
        enabled: server.enabled,
        id: server.id,
        name: server.name,
        status: server.status,
      }));
    }
  );

  const errorSchema = z
    .object({ error: z.string() })
    .openapi("TapinallApiErrorResponse");

  app.openAPIRegistry.registerPath(
    createRoute({
      method: "get",
      operationId: "getTapinallStatus",
      path: "/v1/tapinall/status",
      responses: {
        200: {
          content: {
            "application/json": {
              schema: z.object({}).passthrough(),
            },
          },
          description: "Tapinall connection status",
        },
        400: {
          content: { "application/json": { schema: errorSchema } },
          description: "Bad request",
        },
      },
      tags: ["Tapinall"],
    })
  );

  app.get("/v1/tapinall/status", async (c) => {
    requireOrgMemberFromContext(c);

    try {
      return json(await service.status());
    } catch (error) {
      if (error instanceof AirinApiError) {
        return errorResponse(error.message, error.status, { code: error.code });
      }

      return errorResponse(
        error instanceof Error ? error.message : "Tapinall request failed.",
        400
      );
    }
  });

  app.openAPIRegistry.registerPath(
    createRoute({
      method: "get",
      operationId: "browseTapinallCatalog",
      path: "/v1/tapinall/catalog/browse",
      responses: {
        200: {
          content: {
            "application/json": {
              schema: z.object({}).passthrough(),
            },
          },
          description: "Tapinall catalog browse",
        },
        400: {
          content: { "application/json": { schema: errorSchema } },
          description: "Bad request",
        },
      },
      tags: ["Tapinall"],
    })
  );

  app.get("/v1/tapinall/catalog/browse", async (c) => {
    requireOrgMemberFromContext(c);

    try {
      return json(await service.browse());
    } catch (error) {
      if (error instanceof AirinApiError) {
        return errorResponse(error.message, error.status, { code: error.code });
      }

      return errorResponse(
        error instanceof Error ? error.message : "Tapinall request failed.",
        400
      );
    }
  });

  app.openAPIRegistry.registerPath(
    createRoute({
      method: "get",
      operationId: "searchTapinallCatalog",
      path: "/v1/tapinall/catalog/search",
      request: {
        query: z.object({
          limit: z.string().optional(),
          q: z.string().optional(),
        }),
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: z.object({}).passthrough(),
            },
          },
          description: "Tapinall catalog search",
        },
        400: {
          content: { "application/json": { schema: errorSchema } },
          description: "Bad request",
        },
      },
      tags: ["Tapinall"],
    })
  );

  app.get("/v1/tapinall/catalog/search", async (c) => {
    requireOrgMemberFromContext(c);

    const q = c.req.query("q") ?? "";
    const limitRaw = c.req.query("limit");
    const limit = limitRaw ? Number(limitRaw) : 25;

    try {
      return json(await service.search(q, limit));
    } catch (error) {
      if (error instanceof AirinApiError) {
        return errorResponse(error.message, error.status, { code: error.code });
      }

      return errorResponse(
        error instanceof Error ? error.message : "Tapinall request failed.",
        400
      );
    }
  });
}
