import { createId } from "../ids";
import type {
  VaultGraph,
  VaultGraphEdge,
  VaultGraphNode,
  VaultLink,
  VaultNote,
} from "./vault-types";
import { extractWikilinks, slugifyNoteTitle } from "./vault-wikilinks";

export function buildVaultLinksFromNotes(
  notes: VaultNote[],
  now = new Date().toISOString()
): VaultLink[] {
  const slugMap = new Map<string, string>();

  for (const note of notes) {
    slugMap.set(note.slug.toLowerCase(), note.id);
    slugMap.set(slugifyNoteTitle(note.title), note.id);
    slugMap.set(note.title.toLowerCase(), note.id);
  }

  const links: VaultLink[] = [];

  for (const note of notes) {
    const targets = extractWikilinks(note.content);

    for (const target of targets) {
      const targetId =
        slugMap.get(target.toLowerCase()) ??
        slugMap.get(slugifyNoteTitle(target));

      links.push({
        createdAt: now,
        id: createId("vlink"),
        linkType: "wikilink",
        sourceId: note.id,
        targetId,
        targetSlug: target,
      });
    }
  }

  return links;
}

export function buildVaultGraph(
  notes: VaultNote[],
  links: VaultLink[]
): VaultGraph {
  const degree = new Map<string, number>();

  for (const note of notes) {
    degree.set(note.id, 0);
  }

  const edges: VaultGraphEdge[] = [];

  for (const link of links) {
    if (!link.targetId) {
      continue;
    }

    edges.push({
      id: link.id,
      source: link.sourceId,
      target: link.targetId,
      targetSlug: link.targetSlug,
    });
    degree.set(link.sourceId, (degree.get(link.sourceId) ?? 0) + 1);
    degree.set(link.targetId, (degree.get(link.targetId) ?? 0) + 1);
  }

  const nodes: VaultGraphNode[] = notes.map((n) => ({
    id: n.id,
    linkCount: degree.get(n.id) ?? 0,
    noteType: n.noteType,
    slug: n.slug,
    title: n.title,
  }));

  return { edges, nodes };
}

export type VaultNoteLinksBreakdown = {
  brokenLinks: string[];
  inboundLinks: VaultLink[];
  outboundLinks: VaultLink[];
};

export function linksForNote(
  noteId: string,
  links: VaultLink[]
): VaultNoteLinksBreakdown {
  const outboundLinks = links.filter((l) => l.sourceId === noteId);
  const inboundLinks = links.filter((l) => l.targetId === noteId);

  const brokenLinks = outboundLinks
    .values()
    .filter((l) => !l.targetId)
    .map((l) => l.targetSlug)
    .toArray();

  return { brokenLinks, inboundLinks, outboundLinks };
}
