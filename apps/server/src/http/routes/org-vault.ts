import { AirinApiError } from "@airin/core";
import { createRoute, z } from "@hono/zod-openapi";
import type { ServerOptions } from "../context";
import {
  requireOrgAdminFromContext,
  requireOrgMemberFromContext,
} from "../org-guards";
import { json, readJson } from "../shared";
import type { HonoApp } from "../types";

export function registerOrgVaultRoutes(
  app: HonoApp,
  options: ServerOptions
): void {
  const vaultService = options.orgVaultService;

  const errorSchema = z
    .object({ error: z.string() })
    .openapi("ApiErrorResponse");

  const orgIdParam = z.object({
    orgId: z.string().openapi({ param: { in: "path", name: "orgId" } }),
  });

  const noteIdParam = orgIdParam.extend({
    noteId: z.string().openapi({ param: { in: "path", name: "noteId" } }),
  });

  const passthrough = z.object({}).passthrough();

  function resolveOrgId(
    c: { req: { param: (n: string) => string } },
    authOrgId: string
  ): string {
    const orgId = decodeURIComponent(c.req.param("orgId"));

    if (authOrgId !== orgId) {
      throw new AirinApiError("Not found", 404);
    }

    return orgId;
  }

  function requireService() {
    if (!vaultService) {
      throw new AirinApiError("Company vault service not configured", 500);
    }

    return vaultService;
  }

  app.openAPIRegistry.registerPath(
    createRoute({
      method: "get",
      operationId: "listVaultNotes",
      path: "/v1/orgs/{orgId}/vault/notes",
      request: {
        params: orgIdParam,
        query: z.object({ q: z.string().optional() }),
      },
      responses: {
        200: {
          content: { "application/json": { schema: passthrough } },
          description: "Vault notes",
        },
        403: {
          content: { "application/json": { schema: errorSchema } },
          description: "Error",
        },
        404: {
          content: { "application/json": { schema: errorSchema } },
          description: "Error",
        },
      },
      summary: "List company vault notes",
      tags: ["Org Vault"],
    })
  );

  app.get("/v1/orgs/:orgId/vault/notes", async (c) => {
    const auth = requireOrgMemberFromContext(c);
    const orgId = resolveOrgId(c, auth.activeOrgId ?? "");
    const service = requireService();
    const q = c.req.query("q")?.trim();
    let notes = await service.listNotes(orgId);

    if (q) {
      const lower = q.toLowerCase();
      notes = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(lower) ||
          n.content.toLowerCase().includes(lower) ||
          n.tags.some((t) => t.toLowerCase().includes(lower))
      );
    }

    return json({ notes });
  });

  app.openAPIRegistry.registerPath(
    createRoute({
      method: "get",
      operationId: "getVaultNote",
      path: "/v1/orgs/{orgId}/vault/notes/{noteId}",
      request: { params: noteIdParam },
      responses: {
        200: {
          content: { "application/json": { schema: passthrough } },
          description: "Vault note",
        },
        404: {
          content: { "application/json": { schema: errorSchema } },
          description: "Error",
        },
      },
      summary: "Get a company vault note",
      tags: ["Org Vault"],
    })
  );

  app.get("/v1/orgs/:orgId/vault/notes/:noteId", async (c) => {
    const auth = requireOrgMemberFromContext(c);
    const orgId = resolveOrgId(c, auth.activeOrgId ?? "");
    const noteId = decodeURIComponent(c.req.param("noteId"));
    const note = await requireService().getNote(orgId, noteId);

    if (!note) {
      throw new AirinApiError("Vault note not found", 404);
    }

    return json({ note });
  });

  app.openAPIRegistry.registerPath(
    createRoute({
      method: "post",
      operationId: "createVaultNote",
      path: "/v1/orgs/{orgId}/vault/notes",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                content: z.string().optional(),
                noteType: z.string().optional(),
                slug: z.string().optional(),
                tags: z.array(z.string()).optional(),
                title: z.string(),
              }),
            },
          },
        },
        params: orgIdParam,
      },
      responses: {
        200: {
          content: { "application/json": { schema: passthrough } },
          description: "Created",
        },
      },
      summary: "Create a company vault note",
      tags: ["Org Vault"],
    })
  );

  app.post("/v1/orgs/:orgId/vault/notes", async (c) => {
    const auth = requireOrgMemberFromContext(c);
    const orgId = resolveOrgId(c, auth.activeOrgId ?? "");
    const body = await readJson<{
      content?: string;
      noteType?: string;
      slug?: string;
      tags?: string[];
      title: string;
    }>(c.req.raw);
    const note = await requireService().createNote(orgId, body);

    return json({ note });
  });

  app.openAPIRegistry.registerPath(
    createRoute({
      method: "put",
      operationId: "updateVaultNote",
      path: "/v1/orgs/{orgId}/vault/notes/{noteId}",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                content: z.string().optional(),
                noteType: z.string().optional(),
                slug: z.string().optional(),
                tags: z.array(z.string()).optional(),
                title: z.string().optional(),
              }),
            },
          },
        },
        params: noteIdParam,
      },
      responses: {
        200: {
          content: { "application/json": { schema: passthrough } },
          description: "Updated",
        },
      },
      summary: "Update a company vault note",
      tags: ["Org Vault"],
    })
  );

  app.put("/v1/orgs/:orgId/vault/notes/:noteId", async (c) => {
    const auth = requireOrgMemberFromContext(c);
    const orgId = resolveOrgId(c, auth.activeOrgId ?? "");
    const noteId = decodeURIComponent(c.req.param("noteId"));
    const body = await readJson<{
      content?: string;
      noteType?: string;
      slug?: string;
      tags?: string[];
      title?: string;
    }>(c.req.raw);
    const note = await requireService().updateNote(orgId, noteId, body);

    return json({ note });
  });

  app.delete("/v1/orgs/:orgId/vault/notes/:noteId", async (c) => {
    const auth = requireOrgAdminFromContext(c);
    const orgId = resolveOrgId(c, auth.activeOrgId ?? "");
    const noteId = decodeURIComponent(c.req.param("noteId"));
    await requireService().deleteNote(orgId, noteId);

    return json({ ok: true });
  });

  app.get("/v1/orgs/:orgId/vault/graph", async (c) => {
    const auth = requireOrgMemberFromContext(c);
    const orgId = resolveOrgId(c, auth.activeOrgId ?? "");
    const graph = await requireService().getGraph(orgId);

    return json(graph);
  });

  app.post("/v1/orgs/:orgId/vault/search", async (c) => {
    const auth = requireOrgMemberFromContext(c);
    const orgId = resolveOrgId(c, auth.activeOrgId ?? "");
    const body = await readJson<{ limit?: number; query: string }>(c.req.raw);
    const query = body.query?.trim();

    if (!query) {
      throw new AirinApiError("query is required", 400);
    }

    const result = await requireService().search(orgId, query, body.limit ?? 5);

    return json(result);
  });
}
