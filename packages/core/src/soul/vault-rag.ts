import type { VaultNote } from "./vault-types";

const STOPWORDS = new Set([
  "yang",
  "dan",
  "di",
  "ke",
  "dari",
  "untuk",
  "dengan",
  "pada",
  "ini",
  "itu",
  "ada",
  "apa",
  "bagaimana",
  "the",
  "and",
  "for",
  "are",
  "was",
  "how",
  "what",
  "when",
  "where",
  "about",
  "with",
  "from",
  "that",
  "this",
  "bisa",
  "tolong",
  "mohon",
  "juga",
  "saya",
  "kami",
  "kita",
  "akan",
  "sudah",
  "belum",
  "atau",
  "tentang",
  "lebih",
  "semua",
]);

export type VaultRAGOptions = {
  maxChars?: number;
  maxChunks?: number;
  maxNotes?: number;
};

export type VaultRAGResult = {
  chunkCount: number;
  context: string;
  noteCount: number;
  titles: string[];
};

type ScoredChunk = {
  chunk: string;
  note: VaultNote;
  reason: string;
  score: number;
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/\[\[([^\]]+)\]\]/g, " $1 ")
    .split(/[^a-z0-9\u00C0-\u024F]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function chunkNoteContent(content: string, maxLen = 520): string[] {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return [];
  }

  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if ((current + "\n\n" + paragraph).length > maxLen && current) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function scoreChunk(
  queryTokens: string[],
  note: VaultNote,
  chunk: string
): ScoredChunk | null {
  if (queryTokens.length === 0) {
    return null;
  }

  const haystack =
    `${note.title}\n${note.tags.join(" ")}\n${chunk}`.toLowerCase();

  let score = 0;
  const hit: string[] = [];

  for (const token of queryTokens) {
    if (haystack.includes(token)) {
      score += note.title.toLowerCase().includes(token) ? 3 : 1;
      hit.push(token);
    }
  }

  if (score <= 0) {
    return null;
  }

  return {
    chunk,
    note,
    reason: hit.slice(0, 6).join(", "),
    score,
  };
}

/**
 * Keyword RAG over vault notes. No embeddings — lean for 512 MB installs.
 */
export function retrieveVaultRAG(
  notes: VaultNote[],
  query: string,
  options: VaultRAGOptions = {}
): VaultRAGResult {
  const maxNotes = options.maxNotes ?? 5;
  const maxChunks = options.maxChunks ?? 8;
  const maxChars = options.maxChars ?? 2048;
  const queryTokens = tokenize(query);

  if (queryTokens.length === 0 || notes.length === 0) {
    return { chunkCount: 0, context: "", noteCount: 0, titles: [] };
  }

  const scored: ScoredChunk[] = [];

  for (const note of notes) {
    const chunks = chunkNoteContent(note.content);

    if (chunks.length === 0) {
      const hit = scoreChunk(queryTokens, note, note.title);

      if (hit) {
        scored.push(hit);
      }

      continue;
    }

    for (const chunk of chunks) {
      const hit = scoreChunk(queryTokens, note, chunk);

      if (hit) {
        scored.push(hit);
      }
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const selected: ScoredChunk[] = [];
  const titles = new Set<string>();

  for (const item of scored) {
    if (selected.length >= maxChunks) {
      break;
    }

    if (titles.size >= maxNotes && !titles.has(item.note.title)) {
      continue;
    }

    selected.push(item);
    titles.add(item.note.title);
  }

  const parts: string[] = [];
  let used = 0;

  for (const item of selected) {
    const block = `### ${item.note.title} (${item.note.noteType})\n${item.chunk}`;

    if (used + block.length > maxChars) {
      break;
    }

    parts.push(block);
    used += block.length + 2;
  }

  return {
    chunkCount: parts.length,
    context: parts.join("\n\n"),
    noteCount: titles.size,
    titles: Array.from(titles),
  };
}

/** Compact catalog for system-prompt injection. */
export function composeVaultCatalog(
  notes: Array<Pick<VaultNote, "noteType" | "title">>,
  { byteCap = 1024 }: { byteCap?: number } = {}
): string {
  if (notes.length === 0) {
    return "";
  }

  const lines = [
    "## Company Vault",
    "",
    "Shared company notes (use `vault_search` / `vault_write` for detail).",
    "",
  ];

  for (const note of notes) {
    lines.push(`- [${note.noteType}] ${note.title}`);
  }

  lines.push(
    "",
    "Link notes with [[Note Title]] wikilinks. Capture durable company knowledge here."
  );

  let text = lines.join("\n");
  const encoder = new TextEncoder();

  if (encoder.encode(text).byteLength <= byteCap) {
    return text;
  }

  // Drop titles from the end until under cap.
  const kept = [...notes];

  while (kept.length > 0) {
    kept.pop();

    const trimmedLines = [
      "## Company Vault",
      "",
      "Shared company notes (use `vault_search` / `vault_write` for detail).",
      "",
      ...kept.map((n) => `- [${n.noteType}] ${n.title}`),
      "",
      `…and ${notes.length - kept.length} more. Call vault_list or vault_search.`,
    ];

    text = trimmedLines.join("\n");

    if (encoder.encode(text).byteLength <= byteCap) {
      return text;
    }
  }

  return "## Company Vault\n\nCall vault_search for company notes.";
}

export function appendVaultSection(
  systemPrompt: string,
  catalog: string
): string {
  const trimmed = catalog.trim();

  if (!trimmed) {
    return systemPrompt;
  }

  return `${systemPrompt.trim()}\n\n${trimmed}`;
}
