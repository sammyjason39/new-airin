import {
  emptyObjectSchema,
  requireToolOrgMember,
  type ToolContext,
  type ToolDefinition,
} from "@airin/core";
import { z } from "zod";
import type { OrgVaultService } from "../services/org-vault-service";

const VaultSearchInputSchema = z.object({
  limit: z.number().optional().catch(undefined),
  query: z.string().optional().catch(undefined),
});

const VaultWriteInputSchema = z.object({
  content: z.string().optional().catch(undefined),
  noteId: z.string().optional().catch(undefined),
  noteType: z.string().optional().catch(undefined),
  tags: z.array(z.string()).optional().catch(undefined),
  title: z.string().optional().catch(undefined),
});

function requireOrgId(context: ToolContext): string {
  const orgId = context.orgId?.trim();

  if (!orgId) {
    throw new Error("Organization context is required.");
  }

  return orgId;
}

function requireVaultAccess(context: ToolContext) {
  const orgId = requireOrgId(context);
  requireToolOrgMember(context);

  return { orgId };
}

export function createOrgVaultTools(
  service: OrgVaultService
): ToolDefinition[] {
  return [
    {
      description:
        "Search the company vault (second brain) for notes relevant to the query. Returns matching note titles and excerpt context. Use when you need company SOPs, MOM, docs, or linked knowledge beyond the injected vault catalog.",
      name: "vault_search",
      parallelSafe: true,
      parameters: {
        additionalProperties: false,
        properties: {
          limit: {
            description: "Max notes to return (default 5).",
            type: "number",
          },
          query: {
            description: "Search query for vault notes.",
            type: "string",
          },
        },
        required: ["query"],
        type: "object",
      },
      async run(input, context: ToolContext) {
        const parsed = VaultSearchInputSchema.parse(input);
        const { orgId } = requireVaultAccess(context);
        const query = parsed.query?.trim();

        if (!query) {
          throw new Error("query is required.");
        }

        return service.search(orgId, query, parsed.limit ?? 5);
      },
    },
    {
      description:
        "List company vault notes (title, type, slug, tags, updatedAt). Does not return full bodies — use vault_search or open a note by writing with noteId after list.",
      name: "vault_list",
      parallelSafe: true,
      parameters: emptyObjectSchema(),
      async run(_input, context: ToolContext) {
        const { orgId } = requireVaultAccess(context);
        const notes = await service.listNotes(orgId);

        return {
          notes: notes.map((n) => ({
            id: n.id,
            noteType: n.noteType,
            slug: n.slug,
            tags: n.tags,
            title: n.title,
            updatedAt: n.updatedAt,
          })),
        };
      },
    },
    {
      description:
        "Write durable company knowledge into the Company Vault. Create a new note or update an existing one (pass noteId). Use [[Note Title]] wikilinks to connect related notes. Prefer vault over propose_org_memory when the knowledge is a document, SOP, MOM, or multi-paragraph note. Never store secrets, credentials, or PII.",
      name: "vault_write",
      parallelSafe: false,
      parameters: {
        additionalProperties: false,
        properties: {
          content: {
            description: "Markdown body. Use [[Other Note]] for graph links.",
            type: "string",
          },
          noteId: {
            description: "Existing note id or slug to update. Omit to create.",
            type: "string",
          },
          noteType: {
            description: "One of: note, mom, meeting, doc, sop.",
            type: "string",
          },
          tags: {
            description: "Optional short tags.",
            items: { type: "string" },
            type: "array",
          },
          title: {
            description: "Note title (required when creating).",
            type: "string",
          },
        },
        required: ["title"],
        type: "object",
      },
      async run(input, context: ToolContext) {
        const parsed = VaultWriteInputSchema.safeParse(input);
        const toolInput = parsed.success ? parsed.data : {};
        const { orgId } = requireVaultAccess(context);
        const title = toolInput.title?.trim();
        const noteId = toolInput.noteId?.trim();

        if (noteId) {
          return service.updateNote(orgId, noteId, {
            content: toolInput.content,
            noteType: toolInput.noteType,
            tags: toolInput.tags,
            title,
          });
        }

        if (!title) {
          throw new Error("title is required when creating a vault note.");
        }

        return service.createNote(orgId, {
          content: toolInput.content,
          noteType: toolInput.noteType,
          tags: toolInput.tags,
          title,
        });
      },
    },
  ];
}
