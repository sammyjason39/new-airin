import { AirinApiError } from "@airin/core";
import { createRoute, z } from "@hono/zod-openapi";
import { DesignService } from "../../services/design-service";
import type { ServerOptions } from "../context";
import {
  requireActiveOrgIdFromContext,
  requireOrgMemberFromContext,
} from "../org-guards";
import { errorResponse, json, readJson } from "../shared";
import type { HonoApp } from "../types";

const generateBodySchema = z
  .object({
    aspectRatio: z.string().trim().max(32).optional(),
    count: z.number().int().min(1).max(4).optional(),
    duration: z.number().positive().max(60).optional(),
    estimateOnly: z.boolean().optional(),
    kind: z.enum(["image", "video"]),
    model: z.string().trim().min(1).max(128),
    params: z.record(z.string(), z.unknown()).optional(),
    profileId: z.string().trim().min(1).max(128).optional(),
    prompt: z.string().trim().min(1).max(16_000),
    sourceFiles: z
      .array(
        z.object({
          data: z.string().min(1).max(2_800_000),
          filename: z.string().trim().min(1).max(255),
          mediaType: z.string().trim().min(1).max(128),
        })
      )
      .max(4)
      .optional(),
    sourceMediaUrls: z.array(z.string().url().max(2048)).max(8).optional(),
  })
  .openapi("DesignGenerateRequest");

export function registerDesignRoutes(
  app: HonoApp,
  options: ServerOptions
): void {
  const { databaseAdapter, mcpService } = options;

  if (!(databaseAdapter && mcpService)) {
    return;
  }

  const design = new DesignService(databaseAdapter, mcpService);

  app.openapi(
    createRoute({
      method: "get",
      path: "/v1/design/status",
      operationId: "getDesignStatus",
      tags: ["Design"],
      responses: {
        200: {
          description: "Higgsfield MCP connection for Design",
          content: {
            "application/json": {
              schema: z.object({}).passthrough(),
            },
          },
        },
      },
    }),
    async (c) => {
      requireOrgMemberFromContext(c);
      requireActiveOrgIdFromContext(c);

      return json(await design.status());
    }
  );

  app.openapi(
    createRoute({
      method: "get",
      path: "/v1/design/results",
      operationId: "listDesignResults",
      tags: ["Design"],
      responses: {
        200: {
          description: "Stored Design generations",
          content: {
            "application/json": {
              schema: z.object({
                results: z.array(z.object({}).passthrough()),
              }),
            },
          },
        },
      },
    }),
    async (c) => {
      requireOrgMemberFromContext(c);
      const orgId = requireActiveOrgIdFromContext(c);
      const results = await design.listResults(orgId);

      return json({ results });
    }
  );

  app.openapi(
    createRoute({
      method: "post",
      path: "/v1/design/generate",
      operationId: "generateDesign",
      tags: ["Design"],
      request: {
        body: {
          content: {
            "application/json": { schema: generateBodySchema },
          },
          required: true,
        },
      },
      responses: {
        200: {
          description: "Estimate or generation result",
          content: {
            "application/json": {
              schema: z.object({}).passthrough(),
            },
          },
        },
      },
    }),
    async (c) => {
      requireOrgMemberFromContext(c);
      const orgId = requireActiveOrgIdFromContext(c);

      try {
        const body = await readJson(c.req.raw, generateBodySchema);
        const output = await design.generate(orgId, body);

        return json(output);
      } catch (error) {
        if (error instanceof AirinApiError) {
          return errorResponse(error.message, error.status);
        }

        throw error;
      }
    }
  );
}
