import { describe, expect, test } from "bun:test";
import { buildVaultGraph, buildVaultLinksFromNotes } from "./vault-graph";
import {
  buildVaultNote,
  parseVaultNoteFile,
  serializeVaultNote,
} from "./vault-note-format";
import { composeVaultCatalog, retrieveVaultRAG } from "./vault-rag";
import {
  extractWikilinks,
  matchVaultNoteByLinkTitle,
  slugifyNoteTitle,
} from "./vault-wikilinks";

describe("vault wikilinks", () => {
  test("extracts [[targets]]", () => {
    expect(
      extractWikilinks("See [[Org Memory]] and [[SOP Laundry|laundry]]")
    ).toEqual(["Org Memory", "SOP Laundry"]);
  });

  test("slugifyNoteTitle", () => {
    expect(slugifyNoteTitle("Org Memory!")).toBe("org-memory");
  });

  test("matchVaultNoteByLinkTitle", () => {
    const notes = [
      { id: "1", slug: "org-memory", title: "Org Memory" },
      { id: "2", slug: "sop-laundry", title: "SOP Laundry" },
    ];

    expect(matchVaultNoteByLinkTitle(notes, "Org Memory")?.id).toBe("1");
    expect(matchVaultNoteByLinkTitle(notes, "sop-laundry")?.id).toBe("2");
  });
});

describe("vault note format", () => {
  test("round-trips frontmatter", () => {
    const note = buildVaultNote({
      content: "Hello [[Org Memory]]",
      noteType: "sop",
      tags: ["ops"],
      title: "SOP Laundry",
    });

    const raw = serializeVaultNote(note);
    const parsed = parseVaultNoteFile(raw, note.slug);
    expect(parsed?.title).toBe("SOP Laundry");
    expect(parsed?.noteType).toBe("sop");
    expect(parsed?.content).toContain("[[Org Memory]]");
    expect(parsed?.tags).toEqual(["ops"]);
  });
});

describe("vault graph", () => {
  test("builds edges from wikilinks", () => {
    const a = buildVaultNote({
      content: "See [[B Note]]",
      title: "A Note",
    });

    const b = buildVaultNote({
      content: "Back",
      title: "B Note",
    });

    const links = buildVaultLinksFromNotes([a, b]);
    const graph = buildVaultGraph([a, b], links);
    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]?.source).toBe(a.id);
    expect(graph.edges[0]?.target).toBe(b.id);
  });
});

describe("vault rag", () => {
  test("scores matching chunks", () => {
    const notes = [
      buildVaultNote({
        content: "Laundry pickup is at 9am every weekday.",
        noteType: "sop",
        title: "SOP Laundry",
      }),
      buildVaultNote({
        content: "Marketing calendar for Q1.",
        noteType: "doc",
        title: "Marketing Plan",
      }),
    ];

    const result = retrieveVaultRAG(notes, "laundry pickup weekday");
    expect(result.titles).toContain("SOP Laundry");
    expect(result.context).toContain("Laundry pickup");
  });

  test("composeVaultCatalog", () => {
    const catalog = composeVaultCatalog([
      { noteType: "sop", title: "SOP Laundry" },
    ]);

    expect(catalog).toContain("## Company Vault");
    expect(catalog).toContain("SOP Laundry");
  });
});
