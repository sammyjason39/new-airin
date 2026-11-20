import { mkdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import {
  AirinApiError,
  appendVaultSection,
  assertVaultNoteSize,
  buildVaultGraph,
  buildVaultLinksFromNotes,
  buildVaultNote,
  composeVaultCatalog,
  createId,
  getOrgVaultDir,
  getOrgVaultLinksPath,
  getOrgVaultNotesDir,
  isVaultNoteType,
  linksForNote,
  parseVaultNoteFile,
  retrieveVaultRAG,
  serializeVaultNote,
  VAULT_MAX_NOTES,
  VAULT_MAX_TITLE_LENGTH,
  type VaultLink,
  type VaultNote,
  type VaultNoteType,
  type VaultNoteWithLinks,
} from "@airin/core";
import { createChatLock } from "@airin/core/channel-chat-lock";
import {
  pathExists,
  readDirectoryEntries,
  readTextIfExists,
  writeTextFile,
} from "@airin/core/fs";

const vaultLock = createChatLock();

export interface OrgVaultServiceOptions {
  configDir?: string;
}

type LinksIndexFile = {
  links: VaultLink[];
  updatedAt: string;
};

function noteFilePath(notesDir: string, slug: string): string {
  return join(notesDir, `${slug}.md`);
}

export class OrgVaultService {
  constructor(private readonly options: OrgVaultServiceOptions = {}) {}

  private configDir(): string | undefined {
    return this.options.configDir;
  }

  private async locked<T>(orgId: string, fn: () => Promise<T>): Promise<T> {
    return vaultLock.withLock(`vault:${orgId}`, fn);
  }

  private async ensureDirs(orgId: string): Promise<{
    linksPath: string;
    notesDir: string;
    vaultDir: string;
  }> {
    const vaultDir = getOrgVaultDir(orgId, this.configDir());
    const notesDir = getOrgVaultNotesDir(orgId, this.configDir());
    const linksPath = getOrgVaultLinksPath(orgId, this.configDir());
    await mkdir(notesDir, { recursive: true });

    return { linksPath, notesDir, vaultDir };
  }

  async listNotes(orgId: string): Promise<VaultNote[]> {
    const { notesDir } = await this.ensureDirs(orgId);

    if (!(await pathExists(notesDir))) {
      return [];
    }

    const entries = await readDirectoryEntries(notesDir);
    const notes: VaultNote[] = [];

    for (const entry of entries) {
      if (!(entry.isFile() && entry.name.endsWith(".md"))) {
        continue;
      }

      const slug = entry.name.replace(/\.md$/, "");
      const raw = await readTextIfExists(noteFilePath(notesDir, slug));

      if (!raw) {
        continue;
      }

      const note = parseVaultNoteFile(raw, slug);

      if (note) {
        notes.push(note);
      }
    }

    notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    return notes.slice(0, VAULT_MAX_NOTES);
  }

  private async writeLinksIndex(
    orgId: string,
    notes: VaultNote[]
  ): Promise<VaultLink[]> {
    const { linksPath } = await this.ensureDirs(orgId);
    const links = buildVaultLinksFromNotes(notes);
    const payload: LinksIndexFile = {
      links,
      updatedAt: new Date().toISOString(),
    };
    await writeTextFile(linksPath, `${JSON.stringify(payload, null, 2)}\n`);

    return links;
  }

  private async readLinksIndex(orgId: string): Promise<VaultLink[]> {
    const linksPath = getOrgVaultLinksPath(orgId, this.configDir());
    const raw = await readTextIfExists(linksPath);

    if (!raw) {
      const notes = await this.listNotes(orgId);

      return this.writeLinksIndex(orgId, notes);
    }

    try {
      const parsed = JSON.parse(raw) as LinksIndexFile;

      if (!Array.isArray(parsed.links)) {
        throw new Error("invalid links index");
      }

      return parsed.links;
    } catch {
      const notes = await this.listNotes(orgId);

      return this.writeLinksIndex(orgId, notes);
    }
  }

  async getNote(orgId: string, id: string): Promise<VaultNoteWithLinks | null> {
    const notes = await this.listNotes(orgId);
    const note = notes.find((n) => n.id === id || n.slug === id) ?? null;

    if (!note) {
      return null;
    }

    const links = await this.readLinksIndex(orgId);
    const related = linksForNote(note.id, links);

    return { ...note, ...related };
  }

  async getGraph(orgId: string) {
    const notes = await this.listNotes(orgId);
    const links = await this.readLinksIndex(orgId);

    return buildVaultGraph(notes, links);
  }

  async getCatalog(orgId: string): Promise<string> {
    const notes = await this.listNotes(orgId);

    return composeVaultCatalog(notes);
  }

  appendCatalog(systemPrompt: string, catalog: string): string {
    return appendVaultSection(systemPrompt, catalog);
  }

  async search(orgId: string, query: string, limit = 5) {
    const notes = await this.listNotes(orgId);
    const rag = retrieveVaultRAG(notes, query, {
      maxChunks: Math.max(limit, 5),
      maxNotes: limit,
    });
    const titleSet = new Set(rag.titles.map((t) => t.toLowerCase()));
    const matched = notes
      .filter((n) => titleSet.has(n.title.toLowerCase()))
      .slice(0, limit);

    return {
      chunkCount: rag.chunkCount,
      context: rag.context,
      notes: matched,
      query,
      titles: rag.titles,
    };
  }

  async createNote(
    orgId: string,
    input: {
      content?: string;
      noteType?: string;
      slug?: string;
      tags?: string[];
      title: string;
    }
  ): Promise<VaultNote> {
    return this.locked(orgId, async () => {
      const existing = await this.listNotes(orgId);

      if (existing.length >= VAULT_MAX_NOTES) {
        throw new AirinApiError(
          `Company vault is full (${VAULT_MAX_NOTES} notes). Archive or delete notes first.`,
          400
        );
      }

      const noteType: VaultNoteType =
        input.noteType && isVaultNoteType(input.noteType)
          ? input.noteType
          : "note";
      const note = buildVaultNote({
        content: input.content,
        noteType,
        slug: input.slug,
        tags: input.tags,
        title: input.title,
      });

      if (existing.some((n) => n.slug === note.slug || n.id === note.id)) {
        throw new AirinApiError(
          "A vault note with this slug already exists.",
          409
        );
      }

      const { notesDir } = await this.ensureDirs(orgId);
      const serialized = serializeVaultNote(note);
      assertVaultNoteSize(serialized);
      await writeTextFile(noteFilePath(notesDir, note.slug), serialized);
      await this.writeLinksIndex(orgId, [...existing, note]);

      return note;
    });
  }

  async updateNote(
    orgId: string,
    id: string,
    patch: {
      content?: string;
      noteType?: string;
      slug?: string;
      tags?: string[];
      title?: string;
    }
  ): Promise<VaultNote> {
    return this.locked(orgId, async () => {
      const existing = await this.listNotes(orgId);
      const current = existing.find((n) => n.id === id || n.slug === id);

      if (!current) {
        throw new AirinApiError("Vault note not found", 404);
      }

      const nextTitle = (patch.title ?? current.title)
        .trim()
        .slice(0, VAULT_MAX_TITLE_LENGTH);

      if (!nextTitle) {
        throw new AirinApiError("Vault note title is required.", 400);
      }

      const noteType: VaultNoteType =
        patch.noteType && isVaultNoteType(patch.noteType)
          ? patch.noteType
          : current.noteType;

      const nextSlug = (patch.slug ?? current.slug).trim();
      const updated: VaultNote = {
        ...current,
        content: patch.content ?? current.content,
        noteType,
        slug: nextSlug,
        tags: patch.tags ?? current.tags,
        title: nextTitle,
        updatedAt: new Date().toISOString(),
      };

      if (
        existing.some(
          (n) =>
            n.id !== current.id &&
            (n.slug === updated.slug || n.id === updated.id)
        )
      ) {
        throw new AirinApiError(
          "A vault note with this slug already exists.",
          409
        );
      }

      const { notesDir } = await this.ensureDirs(orgId);
      const serialized = serializeVaultNote(updated);
      assertVaultNoteSize(serialized);

      if (current.slug !== updated.slug) {
        const oldPath = noteFilePath(notesDir, current.slug);

        if (await pathExists(oldPath)) {
          await unlink(oldPath);
        }
      }

      await writeTextFile(noteFilePath(notesDir, updated.slug), serialized);
      const nextList = existing.map((n) => (n.id === current.id ? updated : n));
      await this.writeLinksIndex(orgId, nextList);

      return updated;
    });
  }

  async deleteNote(orgId: string, id: string): Promise<void> {
    return this.locked(orgId, async () => {
      const existing = await this.listNotes(orgId);
      const current = existing.find((n) => n.id === id || n.slug === id);

      if (!current) {
        throw new AirinApiError("Vault note not found", 404);
      }

      const { notesDir } = await this.ensureDirs(orgId);
      const path = noteFilePath(notesDir, current.slug);

      if (await pathExists(path)) {
        await unlink(path);
      }

      await this.writeLinksIndex(
        orgId,
        existing.filter((n) => n.id !== current.id)
      );
    });
  }

  /**
   * Upsert a note from an approved org-memory fact so the company vault
   * captures durable knowledge as linked documents.
   */
  async captureFromOrgMemoryFact(
    orgId: string,
    bullet: string,
    options: { pin?: boolean; sourceProposalId?: string | null } = {}
  ): Promise<VaultNote> {
    const fact = bullet.trim();

    if (!fact) {
      throw new AirinApiError("Empty fact cannot be captured to vault.", 400);
    }

    const title = fact.length > 80 ? `${fact.slice(0, 77).trimEnd()}…` : fact;
    const content = [
      options.pin ? "> Pinned org memory fact" : "> Org memory fact",
      "",
      fact,
      "",
      options.sourceProposalId
        ? `Source proposal: \`${options.sourceProposalId}\``
        : "",
      "",
      "Related: [[Org Memory]]",
    ]
      .filter((line, index, arr) => !(line === "" && arr[index - 1] === ""))
      .join("\n")
      .trim();

    return this.locked(orgId, async () => {
      const existing = await this.listNotes(orgId);
      const hit = existing.find(
        (n) =>
          n.title.toLowerCase() === title.toLowerCase() ||
          n.content.includes(fact)
      );

      if (hit) {
        return this.updateNoteUnlocked(orgId, existing, hit, {
          content: hit.content.includes(fact) ? hit.content : content,
          noteType: "note",
        });
      }

      // Ensure an Org Memory hub note exists for wikilinks.
      if (!existing.some((n) => n.slug === "org-memory")) {
        const hub = buildVaultNote({
          content:
            "Hub for facts promoted from org memory. Link related notes with [[wikilinks]].",
          id: createId("vnote"),
          noteType: "doc",
          slug: "org-memory",
          tags: ["org-memory"],
          title: "Org Memory",
        });
        const { notesDir } = await this.ensureDirs(orgId);
        await writeTextFile(
          noteFilePath(notesDir, hub.slug),
          serializeVaultNote(hub)
        );
        existing.push(hub);
      }

      if (existing.length >= VAULT_MAX_NOTES) {
        throw new AirinApiError(
          `Company vault is full (${VAULT_MAX_NOTES} notes).`,
          400
        );
      }

      const note = buildVaultNote({
        content,
        noteType: "note",
        tags: ["org-memory", options.pin ? "pinned" : "log"],
        title,
      });
      const { notesDir } = await this.ensureDirs(orgId);
      await writeTextFile(
        noteFilePath(notesDir, note.slug),
        serializeVaultNote(note)
      );
      await this.writeLinksIndex(orgId, [...existing, note]);

      return note;
    });
  }

  private async updateNoteUnlocked(
    orgId: string,
    existing: VaultNote[],
    current: VaultNote,
    patch: { content?: string; noteType?: VaultNoteType }
  ): Promise<VaultNote> {
    const updated: VaultNote = {
      ...current,
      content: patch.content ?? current.content,
      noteType: patch.noteType ?? current.noteType,
      updatedAt: new Date().toISOString(),
    };
    const { notesDir } = await this.ensureDirs(orgId);
    await writeTextFile(
      noteFilePath(notesDir, updated.slug),
      serializeVaultNote(updated)
    );
    await this.writeLinksIndex(
      orgId,
      existing.map((n) => (n.id === current.id ? updated : n))
    );

    return updated;
  }
}
