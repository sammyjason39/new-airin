import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ToolContext } from "@airin/core";
import { OrgVaultService } from "../services/org-vault-service";
import { createOrgVaultTools } from "./org-vault-tools";

function context(orgId: string, orgRole?: ToolContext["orgRole"]): ToolContext {
  return { orgId, orgRole };
}

describe("org vault tools", () => {
  let configDir: string;

  afterEach(async () => {
    if (configDir) {
      await rm(configDir, { force: true, recursive: true });
    }
  });

  async function vaultService() {
    configDir = await mkdtemp(join(tmpdir(), "airin-vault-tools-"));

    return new OrgVaultService({ configDir });
  }

  test("vault_search as member returns matches", async () => {
    const service = await vaultService();
    const orgId = "org_a";
    await service.createNote(orgId, {
      content: "Deploy windows open Tuesday morning.",
      title: "Deploy SOP",
    });

    const [searchTool] = createOrgVaultTools(service);
    const result = await searchTool.run(
      { query: "deploy tuesday" },
      context(orgId, "member")
    );

    expect(result.titles).toContain("Deploy SOP");
    expect(result.query).toBe("deploy tuesday");
  });

  test("vault_search with undefined orgRole throws (deny-by-default)", async () => {
    const service = await vaultService();
    const [searchTool] = createOrgVaultTools(service);
    await expect(
      searchTool.run({ query: "x" }, context("org_a", undefined))
    ).rejects.toMatchObject({ status: 403 });
  });

  test("vault_search with missing orgId throws", async () => {
    const service = await vaultService();
    const [searchTool] = createOrgVaultTools(service);
    await expect(
      searchTool.run({ query: "x" }, { orgRole: "member" })
    ).rejects.toThrow("Organization context is required.");
  });

  test("vault_search with empty query throws", async () => {
    const service = await vaultService();
    const [searchTool] = createOrgVaultTools(service);
    await expect(
      searchTool.run({ query: "  " }, context("org_a", "member"))
    ).rejects.toThrow("query is required.");
  });

  test("vault_list as member returns note summaries", async () => {
    const service = await vaultService();
    const orgId = "org_list";
    const created = await service.createNote(orgId, {
      content: "Body",
      noteType: "sop",
      tags: ["ops"],
      title: "Runbook",
    });

    const listTool = createOrgVaultTools(service)[1];
    const result = await listTool.run({}, context(orgId, "admin"));

    expect(result.notes).toEqual([
      {
        id: created.id,
        noteType: "sop",
        slug: created.slug,
        tags: ["ops"],
        title: "Runbook",
        updatedAt: created.updatedAt,
      },
    ]);
  });

  test("vault_list without org context throws", async () => {
    const service = await vaultService();
    const listTool = createOrgVaultTools(service)[1];
    await expect(listTool.run({}, context("", "member"))).rejects.toThrow(
      "Organization context is required."
    );
  });

  test("vault_write creates a note for org members", async () => {
    const service = await vaultService();
    const orgId = "org_write";
    const writeTool = createOrgVaultTools(service)[2];

    const created = await writeTool.run(
      {
        content: "Step one then step two.",
        noteType: "sop",
        title: "New SOP",
      },
      context(orgId, "member")
    );

    expect(created.title).toBe("New SOP");
    const listed = await service.listNotes(orgId);
    expect(listed.some((n) => n.id === created.id)).toBe(true);
  });

  test("vault_write updates by noteId", async () => {
    const service = await vaultService();
    const orgId = "org_write_update";
    const writeTool = createOrgVaultTools(service)[2];

    const created = await service.createNote(orgId, {
      content: "v1",
      title: "Mutable Note",
    });

    const updated = await writeTool.run(
      {
        content: "v2",
        noteId: created.id,
        title: "Mutable Note",
      },
      context(orgId, "member")
    );

    expect(updated.id).toBe(created.id);
    expect(updated.content).toBe("v2");
  });

  test("vault_write without orgId throws", async () => {
    const service = await vaultService();
    const writeTool = createOrgVaultTools(service)[2];
    await expect(
      writeTool.run({ title: "Orphan" }, { orgRole: "member" })
    ).rejects.toThrow("Organization context is required.");
  });
});
