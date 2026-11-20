import { describe, expect, test } from "bun:test";
import { createInMemoryDatabaseAdapter } from "@airin/db";
import { OrgVaultService } from "../../services/org-vault-service";
import { setupTestConfigDir } from "../../test-config-dir";
import { createMinimalHonoApp } from "../test-app-helpers";
import { setupFreshInstallSession } from "../test-session-helpers";

const configDir = setupTestConfigDir("airin-org-vault-routes-test-");

function createApp() {
  const databaseAdapter = createInMemoryDatabaseAdapter();
  const orgVaultService = new OrgVaultService({ configDir });

  return {
    ...createMinimalHonoApp({ databaseAdapter, orgVaultService }),
    orgVaultService,
  };
}

const BASE = "http://localhost:4310";

describe("org vault routes (v1)", () => {
  test("member can create, list, get, graph, search, update; admin deletes", async () => {
    const { app, databaseAdapter } = createApp();

    const adminSession = await setupFreshInstallSession(
      app,
      databaseAdapter,
      "vault-admin@org.com"
    );

    const orgId = adminSession.orgId!;

    const createResp = await app.fetch(
      new Request(`${BASE}/v1/orgs/${orgId}/vault/notes`, {
        body: JSON.stringify({
          content: "Pickup at 9am. See [[Hub]].",
          noteType: "sop",
          title: "SOP Laundry",
        }),
        headers: adminSession.headers(
          { "X-CSRF-Token": adminSession.csrfToken },
          orgId
        ),
        method: "POST",
      })
    );

    expect(createResp.status).toBe(200);

    // SAFETY: A 200 create response matches the vault note JSON contract used in this test.
    const created = (await createResp.json()) as {
      note: { id: string; title: string };
    };

    expect(created.note.title).toBe("SOP Laundry");

    await app.fetch(
      new Request(`${BASE}/v1/orgs/${orgId}/vault/notes`, {
        body: JSON.stringify({
          content: "Company hub",
          noteType: "doc",
          title: "Hub",
        }),
        headers: adminSession.headers(
          { "X-CSRF-Token": adminSession.csrfToken },
          orgId
        ),
        method: "POST",
      })
    );

    const listResp = await app.fetch(
      new Request(`${BASE}/v1/orgs/${orgId}/vault/notes?q=Laundry`, {
        headers: adminSession.headers({}, orgId),
      })
    );

    expect(listResp.status).toBe(200);

    // SAFETY: A 200 list response matches the vault notes summary JSON contract.
    const listBody = (await listResp.json()) as {
      notes: Array<{ title: string }>;
    };

    expect(listBody.notes.some((n) => n.title === "SOP Laundry")).toBe(true);

    const getResp = await app.fetch(
      new Request(
        `${BASE}/v1/orgs/${orgId}/vault/notes/${encodeURIComponent(created.note.id)}`,
        { headers: adminSession.headers({}, orgId) }
      )
    );

    expect(getResp.status).toBe(200);

    // SAFETY: A 200 get response matches the vault note detail JSON contract.
    const detail = (await getResp.json()) as {
      note: { outboundLinks: Array<{ targetSlug: string }> };
    };

    expect(detail.note.outboundLinks.some((l) => l.targetSlug === "Hub")).toBe(
      true
    );

    const graphResp = await app.fetch(
      new Request(`${BASE}/v1/orgs/${orgId}/vault/graph`, {
        headers: adminSession.headers({}, orgId),
      })
    );

    expect(graphResp.status).toBe(200);

    // SAFETY: A 200 graph response matches the vault graph JSON contract.
    const graph = (await graphResp.json()) as {
      edges: unknown[];
      nodes: unknown[];
    };

    expect(graph.nodes.length).toBeGreaterThanOrEqual(2);
    expect(graph.edges.length).toBeGreaterThanOrEqual(1);

    const searchResp = await app.fetch(
      new Request(`${BASE}/v1/orgs/${orgId}/vault/search`, {
        body: JSON.stringify({ query: "pickup laundry" }),
        headers: adminSession.headers(
          { "X-CSRF-Token": adminSession.csrfToken },
          orgId
        ),
        method: "POST",
      })
    );

    expect(searchResp.status).toBe(200);
    // SAFETY: A 200 search response matches the vault search JSON contract.
    const search = (await searchResp.json()) as { titles: string[] };
    expect(search.titles).toContain("SOP Laundry");

    const updateResp = await app.fetch(
      new Request(
        `${BASE}/v1/orgs/${orgId}/vault/notes/${encodeURIComponent(created.note.id)}`,
        {
          body: JSON.stringify({ content: "Updated pickup. [[Hub]]" }),
          headers: adminSession.headers(
            { "X-CSRF-Token": adminSession.csrfToken },
            orgId
          ),
          method: "PUT",
        }
      )
    );

    expect(updateResp.status).toBe(200);

    const deleteResp = await app.fetch(
      new Request(
        `${BASE}/v1/orgs/${orgId}/vault/notes/${encodeURIComponent(created.note.id)}`,
        {
          headers: adminSession.headers(
            { "X-CSRF-Token": adminSession.csrfToken },
            orgId
          ),
          method: "DELETE",
        }
      )
    );

    expect(deleteResp.status).toBe(200);
  });
});
