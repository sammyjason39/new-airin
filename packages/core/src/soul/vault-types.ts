/** Company vault note kinds (Obsidian-style second brain). */
export type VaultNoteType = "note" | "mom" | "doc" | "sop" | "meeting";

export const VAULT_NOTE_TYPES: readonly VaultNoteType[] = [
  "note",
  "mom",
  "doc",
  "sop",
  "meeting",
] as const;

export function isVaultNoteType(value: string): value is VaultNoteType {
  // SAFETY: VaultNoteType is the union of VAULT_NOTE_TYPES; includes checks membership.
  return (VAULT_NOTE_TYPES as readonly string[]).includes(value);
}

export type VaultNote = {
  content: string;
  createdAt: string;
  id: string;
  noteType: VaultNoteType;
  slug: string;
  tags: string[];
  title: string;
  updatedAt: string;
};

export type VaultLink = {
  createdAt: string;
  id: string;
  linkType: string;
  sourceId: string;
  targetId?: string;
  targetSlug: string;
};

export type VaultNoteWithLinks = VaultNote & {
  brokenLinks: string[];
  inboundLinks: VaultLink[];
  outboundLinks: VaultLink[];
};

export type VaultGraphNode = {
  id: string;
  linkCount: number;
  noteType: VaultNoteType;
  slug: string;
  title: string;
};

export type VaultGraphEdge = {
  id: string;
  source: string;
  target: string;
  targetSlug: string;
};

export type VaultGraph = {
  edges: VaultGraphEdge[];
  nodes: VaultGraphNode[];
};

/** Hard caps so vault work stays within lean install budgets. */
export const VAULT_MAX_NOTES = 200;

export const VAULT_MAX_NOTE_BYTES = 32_768;

export const VAULT_MAX_TITLE_LENGTH = 200;

export const VAULT_MAX_TAGS = 20;

export const VAULT_LINKS_INDEX_FILE = "links.json";

export const VAULT_NOTES_DIR = "notes";
