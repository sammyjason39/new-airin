import { createId } from "../ids";
import {
  isVaultNoteType,
  VAULT_MAX_NOTE_BYTES,
  VAULT_MAX_TAGS,
  VAULT_MAX_TITLE_LENGTH,
  type VaultNote,
  type VaultNoteType,
} from "./vault-types";
import { slugifyNoteTitle } from "./vault-wikilinks";

function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

function escapeYamlString(value: string): string {
  if (/^[a-zA-Z0-9 _./:@+-]+$/.test(value) && !value.includes(": ")) {
    return value;
  }

  return JSON.stringify(value);
}

function parseFrontmatterBlock(block: string): Record<string, string> {
  const result: Record<string, string> = {};

  for (const line of block.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const colon = trimmed.indexOf(":");

    if (colon <= 0) {
      continue;
    }

    const key = trimmed.slice(0, colon).trim();
    let value = trimmed.slice(colon + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      try {
        value = JSON.parse(
          value.replace(/^'/, '"').replace(/'$/, '"')
        ) as string;
      } catch {
        value = value.slice(1, -1);
      }
    }

    result[key] = value;
  }

  return result;
}

function parseTags(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return [];
  }

  const trimmed = raw.trim();

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1);

    return inner
      .split(",")
      .map((part) => part.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean)
      .slice(0, VAULT_MAX_TAGS);
  }

  return trimmed
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, VAULT_MAX_TAGS);
}

export function serializeVaultNote(note: VaultNote): string {
  const tags =
    note.tags.length > 0
      ? `[${note.tags.map((t) => escapeYamlString(t)).join(", ")}]`
      : "[]";

  const frontmatter = [
    "---",
    `id: ${escapeYamlString(note.id)}`,
    `title: ${escapeYamlString(note.title)}`,
    `slug: ${escapeYamlString(note.slug)}`,
    `noteType: ${note.noteType}`,
    `tags: ${tags}`,
    `createdAt: ${escapeYamlString(note.createdAt)}`,
    `updatedAt: ${escapeYamlString(note.updatedAt)}`,
    "---",
    "",
  ].join("\n");

  return `${frontmatter}${note.content.replace(/^\n+/, "")}`;
}

export function parseVaultNoteFile(
  raw: string,
  fallbackSlug: string
): VaultNote | null {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    return null;
  }

  const meta = parseFrontmatterBlock(match[1] ?? "");
  const content = (match[2] ?? "").replace(/^\n+/, "");
  const title = (meta.title ?? fallbackSlug)
    .trim()
    .slice(0, VAULT_MAX_TITLE_LENGTH);

  if (!title) {
    return null;
  }

  const noteTypeRaw = (meta.noteType ?? "note").trim();
  const noteType: VaultNoteType = isVaultNoteType(noteTypeRaw)
    ? noteTypeRaw
    : "note";
  const now = new Date().toISOString();

  return {
    content,
    createdAt: meta.createdAt?.trim() || now,
    id: meta.id?.trim() || createId("vnote"),
    noteType,
    slug: meta.slug?.trim() || slugifyNoteTitle(title) || fallbackSlug,
    tags: parseTags(meta.tags),
    title,
    updatedAt: meta.updatedAt?.trim() || now,
  };
}

export function assertVaultNoteSize(serialized: string): void {
  if (utf8ByteLength(serialized) > VAULT_MAX_NOTE_BYTES) {
    throw new Error(`Vault note exceeds ${VAULT_MAX_NOTE_BYTES} byte limit.`);
  }
}

export function buildVaultNote(input: {
  content?: string;
  id?: string;
  noteType?: VaultNoteType;
  slug?: string;
  tags?: string[];
  title: string;
}): VaultNote {
  const now = new Date().toISOString();
  const title = input.title.trim().slice(0, VAULT_MAX_TITLE_LENGTH);

  if (!title) {
    throw new Error("Vault note title is required.");
  }

  const note: VaultNote = {
    content: input.content ?? "",
    createdAt: now,
    id: input.id?.trim() || createId("vnote"),
    noteType: input.noteType ?? "note",
    slug: input.slug?.trim() || slugifyNoteTitle(title),
    tags: (input.tags ?? []).slice(0, VAULT_MAX_TAGS),
    title,
    updatedAt: now,
  };

  assertVaultNoteSize(serializeVaultNote(note));

  return note;
}
