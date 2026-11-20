import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AirinApiError, VAULT_MAX_NOTE_BYTES } from "@airin/core";
import { pathExists } from "@airin/core/fs";
import { getOrgVaultNotesDir } from "@airin/core/soul/resolve";
import { OrgVaultService } from "./org-vault-service";

describe("OrgVaultService", () => {
  let configDir: string;

  afterEach(async () => {
    if (configDir) {
      await rm(configDir, { force: true, recursive: true });
    }
  });

  async function service() {
    configDir = await mkdtemp(join(tmpdir(), "airin-vault-"));

    return new OrgVaultService({ configDir });
  }

  test("create list get graph and search", async () => {
    const vault = await service();
    const orgId = "org_test";

    const hub = await vault.createNote(orgId, {
      content: "Company hub",
      noteType: "doc",
      title: "Org Memory",
    });
    const note = await vault.createNote(orgId, {
      content: "Pickup at 9am. See [[Org Memory]].",
      noteType: "sop",
      title: "SOP Laundry",
    });

    const listed = await vault.listNotes(orgId);
    expect(listed.map((n) => n.id).sort()).toEqual([hub.id, note.id].sort());

    const detail = await vault.getNote(orgId, note.id);
    expect(detail?.outboundLinks.some((l) => l.targetId === hub.id)).toBe(true);

    const graph = await vault.getGraph(orgId);
    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges.length).toBeGreaterThanOrEqual(1);

    const search = await vault.search(orgId, "pickup laundry");
    expect(search.titles).toContain("SOP Laundry");

    const catalog = await vault.getCatalog(orgId);
    expect(catalog).toContain("Company Vault");
  });

  test("captureFromOrgMemoryFact upserts and links Org Memory hub", async () => {
    const vault = await service();
    const orgId = "org_capture";
    const captured = await vault.captureFromOrgMemoryFact(
      orgId,
      "Support hours are 9am–6pm SGT",
      { pin: true, sourceProposalId: "prop_1" }
    );

    expect(captured.content).toContain("Support hours");
    const notes = await vault.listNotes(orgId);
    expect(notes.some((n) => n.slug === "org-memory")).toBe(true);
    expect(notes.some((n) => n.id === captured.id)).toBe(true);
  });

  test("createNote rejects duplicate slug", async () => {
    const vault = await service();
    const orgId = "org_slug_collision";

    await vault.createNote(orgId, { content: "v1", title: "Ops Handbook" });

    await expect(
      vault.createNote(orgId, { content: "v2", title: "Ops Handbook" })
    ).rejects.toMatchObject({
      message: "A vault note with this slug already exists.",
      status: 409,
    });
  });

  test("updateNote renames slug and removes old file", async () => {
    const vault = await service();
    const orgId = "org_rename";

    const created = await vault.createNote(orgId, {
      content: "Body",
      slug: "alpha-note",
      title: "Alpha Note",
    });
    const notesDir = getOrgVaultNotesDir(orgId, configDir);
    const oldPath = join(notesDir, "alpha-note.md");
    const newPath = join(notesDir, "renamed-alpha.md");

    expect(await pathExists(oldPath)).toBe(true);

    const updated = await vault.updateNote(orgId, created.id, {
      slug: "renamed-alpha",
      title: "Renamed Alpha",
    });

    expect(updated.slug).toBe("renamed-alpha");
    expect(await pathExists(oldPath)).toBe(false);
    expect(await pathExists(newPath)).toBe(true);
  });

  test("updateNote rejects slug collision with another note", async () => {
    const vault = await service();
    const orgId = "org_update_collision";

    const a = await vault.createNote(orgId, {
      slug: "note-a",
      title: "Note A",
    });
    await vault.createNote(orgId, { slug: "note-b", title: "Note B" });

    await expect(
      vault.updateNote(orgId, a.id, { slug: "note-b" })
    ).rejects.toMatchObject({
      message: "A vault note with this slug already exists.",
      status: 409,
    });
  });

  test("deleteNote removes file and graph edges", async () => {
    const vault = await service();
    const orgId = "org_delete";

    const hub = await vault.createNote(orgId, {
      content: "Hub",
      title: "Hub Note",
    });
    const leaf = await vault.createNote(orgId, {
      content: "See [[Hub Note]].",
      title: "Leaf Note",
    });

    const notesDir = getOrgVaultNotesDir(orgId, configDir);
    const leafPath = join(notesDir, `${leaf.slug}.md`);

    expect((await vault.getGraph(orgId)).edges).toHaveLength(1);

    await vault.deleteNote(orgId, leaf.id);

    expect(await pathExists(leafPath)).toBe(false);

    const graph = await vault.getGraph(orgId);
    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0]?.id).toBe(hub.id);
    expect(graph.edges).toHaveLength(0);
    expect(await vault.getNote(orgId, leaf.id)).toBeNull();
  });

  test("getNote reports broken wikilinks when target is missing", async () => {
    const vault = await service();
    const orgId = "org_broken";

    const note = await vault.createNote(orgId, {
      content: "Track [[Ghost Target]] here.",
      title: "Broken Links Note",
    });
    const detail = await vault.getNote(orgId, note.id);

    expect(detail?.brokenLinks).toEqual(["Ghost Target"]);
    expect(
      detail?.outboundLinks.every((link) => link.targetId === undefined)
    ).toBe(true);
    expect((await vault.getGraph(orgId)).edges).toHaveLength(0);
  });

  test("createNote rejects oversize body", async () => {
    const vault = await service();
    const orgId = "org_oversize";
    const huge = "x".repeat(VAULT_MAX_NOTE_BYTES);

    await expect(
      vault.createNote(orgId, { content: huge, title: "Big Note" })
    ).rejects.toThrow(/byte limit/);
  });

  test("updateNote rejects empty title", async () => {
    const vault = await service();
    const orgId = "org_empty_title";

    const note = await vault.createNote(orgId, { title: "Has Title" });

    await expect(
      vault.updateNote(orgId, note.id, { title: "   " })
    ).rejects.toBeInstanceOf(AirinApiError);

    await expect(
      vault.updateNote(orgId, note.id, { title: "   " })
    ).rejects.toMatchObject({ status: 400 });
  });

  test("search returns empty for stopword-only query", async () => {
    const vault = await service();
    const orgId = "org_stopwords";

    await vault.createNote(orgId, {
      content: "Pickup at 9am.",
      title: "SOP Laundry",
    });

    const result = await vault.search(orgId, "the and for");
    expect(result.titles).toEqual([]);
    expect(result.notes).toEqual([]);
    expect(result.chunkCount).toBe(0);
  });

  test("captureFromOrgMemoryFact is idempotent for the same fact", async () => {
    const vault = await service();
    const orgId = "org_idempotent";
    const fact = "Refunds within thirty calendar days";

    const first = await vault.captureFromOrgMemoryFact(orgId, fact, {
      pin: false,
      sourceProposalId: "prop_a",
    });
    const second = await vault.captureFromOrgMemoryFact(orgId, fact, {
      pin: true,
      sourceProposalId: "prop_b",
    });

    expect(second.id).toBe(first.id);

    const notes = await vault.listNotes(orgId);
    const factNotes = notes.filter(
      (n) =>
        n.title.toLowerCase() === first.title.toLowerCase() ||
        n.content.includes(fact)
    );
    expect(factNotes).toHaveLength(1);
  });
});
