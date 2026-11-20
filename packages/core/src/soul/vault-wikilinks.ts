/** Extract [[wikilink]] targets from markdown (Obsidian-style). */
export function extractWikilinks(content: string): string[] {
  const links = new Set<string>();
  const re = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g;
  let match: RegExpExecArray | null = re.exec(content);

  while (match !== null) {
    const target = match[1]?.trim();

    if (target) {
      links.add(target);
    }

    match = re.exec(content);
  }

  return Array.from(links);
}

export function slugifyNoteTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return slug || "note";
}

export function matchVaultNoteByLinkTitle<
  T extends { id: string; slug: string; title: string },
>(notes: T[], linkTitle: string): T | undefined {
  const trimmed = linkTitle.trim();
  const slug = slugifyNoteTitle(trimmed);

  return notes.find(
    (n) =>
      n.title.toLowerCase() === trimmed.toLowerCase() ||
      n.slug === slug ||
      n.slug === trimmed.toLowerCase().replace(/\s+/g, "-")
  );
}

type WikilinkParts = { label: string; title: string };

function parseWikilink(raw: string): WikilinkParts {
  const [targetPart, aliasPart] = raw.split("|");
  const title = (targetPart ?? "").split("#")[0]?.trim() ?? "";

  return {
    label: (aliasPart ?? title).trim(),
    title,
  };
}

/** Convert Obsidian [[wikilinks]] to markdown links that open the vault. */
export function preprocessVaultWikilinks(
  content: string,
  openUrl: (title: string) => string
): string {
  return content.replace(/\[\[([^\]]+)\]\]/g, (_full, raw: string) => {
    const { title, label } = parseWikilink(raw);

    if (!title) {
      return label || raw;
    }

    return `[${label}](${openUrl(title)})`;
  });
}
