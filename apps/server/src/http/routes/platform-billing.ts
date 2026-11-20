import type { PlatformBillingSettingsResponse } from "@airin/core/contract";
import { createRoute, z } from "@hono/zod-openapi";
import type { ServerOptions } from "../context";
import { requirePlatformAdminFromContext } from "../org-guards";
import { errorResponse, json, readJson } from "../shared";
import type { HonoApp } from "../types";

/**
 * Install-wide billing settings (trial days). Kept separate from org CRUD so
 * platform-orgs.ts stays under the file-size budget.
 */
export function registerPlatformBillingRoutes(
  app: HonoApp,
  options: ServerOptions
): void {
  const { databaseAdapter } = options;

  const errorSchema = z
    .object({ error: z.string() })
    .openapi("ApiErrorResponse");

  const platformBillingSettingsSchema = z
    .object({
      trialDays: z.number().int(),
      updatedAt: z.string(),
    })
    .openapi("PlatformBillingSettingsResponse");

  const updatePlatformBillingSettingsSchema = z
    .object({
      trialDays: z.number().int().min(0).max(365),
    })
    .openapi("UpdatePlatformBillingSettingsRequest");

  app.openAPIRegistry.registerPath(
    createRoute({
      method: "get",
      operationId: "getPlatformBillingSettings",
      path: "/v1/platform/billing/settings",
      responses: {
        200: {
          content: {
            "application/json": { schema: platformBillingSettingsSchema },
          },
          description: "Install billing settings",
        },
        403: {
          content: { "application/json": { schema: errorSchema } },
          description: "Error",
        },
        500: {
          content: { "application/json": { schema: errorSchema } },
          description: "Error",
        },
      },
      summary: "Get platform billing settings",
      tags: ["Platform"],
    })
  );

  app.get("/v1/platform/billing/settings", async (c) => {
    requirePlatformAdminFromContext(c);

    if (!databaseAdapter) {
      return errorResponse("Database not configured", 500);
    }

    const settings = await databaseAdapter.getPlatformBillingSettings();

    return json<PlatformBillingSettingsResponse>(settings);
  });

  app.openAPIRegistry.registerPath(
    createRoute({
      method: "patch",
      operationId: "updatePlatformBillingSettings",
      path: "/v1/platform/billing/settings",
      request: {
        body: {
          content: {
            "application/json": { schema: updatePlatformBillingSettingsSchema },
          },
          required: true,
        },
      },
      responses: {
        200: {
          content: {
            "application/json": { schema: platformBillingSettingsSchema },
          },
          description: "Updated billing settings",
        },
        400: {
          content: { "application/json": { schema: errorSchema } },
          description: "Error",
        },
        403: {
          content: { "application/json": { schema: errorSchema } },
          description: "Error",
        },
        500: {
          content: { "application/json": { schema: errorSchema } },
          description: "Error",
        },
      },
      summary: "Update platform billing settings",
      tags: ["Platform"],
    })
  );

  app.patch("/v1/platform/billing/settings", async (c) => {
    requirePlatformAdminFromContext(c);

    if (!databaseAdapter) {
      return errorResponse("Database not configured", 500);
    }

    const body = await readJson(c.req.raw, updatePlatformBillingSettingsSchema);
    const updatedAt = new Date().toISOString();

    await databaseAdapter.upsertPlatformBillingSettings({
      trialDays: body.trialDays,
      updatedAt,
    });

    return json<PlatformBillingSettingsResponse>({
      trialDays: body.trialDays,
      updatedAt,
    });
  });
}
