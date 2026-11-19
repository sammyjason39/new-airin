import { describe, expect, test } from "bun:test";
import type { SkillSummary } from "@airin/core";
import {
  buildSetupChecklist,
  listSetupChecklistCandidates,
  mergeRequiredGoogleSetupItems,
  parseSetupChecklistReply,
  type SetupChecklistSources,
  setupItemIsRequiredGoogle,
} from "./setup-checklist";

function skill(id: string, name: string, enabled = true): SkillSummary {
  return {
    createdAt: "2026-10-24T00:00:00.000Z",
    createdBy: "human",
    description: `${name} skill`,
    disableModelInvocation: false,
    enabled,
    hasTool: false,
    id,
    name,
    sourcePath: `skills/${id}`,
    updatedAt: "2026-10-24T00:00:00.000Z",
  };
}

const sources: SetupChecklistSources = {
  assignedSkillIds: ["skill-assigned"],
  catalog: [
    {
      description: "Ads manager",
      logoUrl: null,
      name: "Meta Ads",
      slug: "metaads",
    },
    { description: null, logoUrl: null, name: "Gmail", slug: "gmail" },
    {
      description: "Files",
      logoUrl: null,
      name: "Google Drive",
      slug: "googledrive",
    },
    {
      description: "Spreadsheets",
      logoUrl: null,
      name: "Google Sheets",
      slug: "googlesheets",
    },
  ],
  orgMemory: "# Org Memory\n\n## Pinned\n",
  skills: [
    skill("skill-report", "Ads report"),
    skill("skill-assigned", "Already on"),
    skill("skill-off", "Disabled", false),
  ],
  userConnections: [
    {
      id: "c1",
      lastError: null,
      status: "connected",
      toolkitId: "t1",
      toolkitSlug: "gmail",
      updatedAt: "2026-10-24T00:00:00.000Z",
    },
  ],
};

const candidates = listSetupChecklistCandidates(sources);

function providerReplying(reply: string) {
  // SAFETY: This test double only calls generateText, and this is its complete implementation.
  return { generateText: async () => reply } as never;
}

describe("listSetupChecklistCandidates", () => {
  test("puts missing Google Drive and Sheets before other apps", () => {
    expect(
      candidates
        .filter((candidate) => candidate.id.startsWith("toolkit:"))
        .map((candidate) => candidate.id)
    ).toEqual([
      "toolkit:googledrive",
      "toolkit:googlesheets",
      "toolkit:metaads",
    ]);
  });

  test("still offers Google when the Composio catalog omits them", () => {
    const thin = listSetupChecklistCandidates({
      ...sources,
      catalog: [],
      userConnections: [],
    });

    expect(
      thin
        .filter((candidate) => candidate.id.startsWith("toolkit:"))
        .map((candidate) => candidate.id)
    ).toEqual(["toolkit:gmail", "toolkit:googledrive", "toolkit:googlesheets"]);
  });
});

describe("mergeRequiredGoogleSetupItems", () => {
  test("prepends missing Google connect steps", () => {
    expect(
      mergeRequiredGoogleSetupItems(
        [
          {
            kind: "connect_toolkit",
            title: "Connect Meta Ads",
            toolkitSlug: "metaads",
          },
        ],
        candidates
      ).map((item) =>
        item.kind === "connect_toolkit" ? item.toolkitSlug : item.kind
      )
    ).toEqual(["googledrive", "googlesheets", "metaads"]);
  });
});

describe("setupItemIsRequiredGoogle", () => {
  test("flags only the Google trio", () => {
    expect(
      setupItemIsRequiredGoogle({
        kind: "connect_toolkit",
        title: "Connect Gmail",
        toolkitSlug: "gmail",
      })
    ).toBe(true);
    expect(
      setupItemIsRequiredGoogle({
        kind: "connect_toolkit",
        title: "Connect Meta Ads",
        toolkitSlug: "metaads",
      })
    ).toBe(false);
  });
});

describe("parseSetupChecklistReply", () => {
  test("maps ids to items in reply order", () => {
    expect(
      parseSetupChecklistReply(
        '```json\n{"goal":"Run ads","items":["context:org","toolkit:metaads"]}\n```',
        candidates
      )
    ).toEqual({
      goal: "Run ads",
      items: [
        {
          kind: "write_context",
          scope: "org",
          title: "Tell the agent about your business",
        },
        {
          kind: "connect_toolkit",
          title: "Connect Meta Ads",
          toolkitSlug: "metaads",
        },
      ],
    });
  });

  test("drops unknown and repeated ids", () => {
    expect(
      parseSetupChecklistReply(
        '{"items":["toolkit:shopify","toolkit:metaads","toolkit:metaads"]}',
        candidates
      )?.items.map((item) => item.kind)
    ).toEqual(["connect_toolkit"]);
  });
});

describe("buildSetupChecklist", () => {
  const userContext = "# About Me\n\n- Help with: Manage my Meta Ads\n";

  test("keeps the saved goal and prepends required Google", async () => {
    const result = await buildSetupChecklist(
      { candidates, userContext },
      {
        provider: providerReplying(
          '{"goal":"Ads","items":["toolkit:metaads"]}'
        ),
      }
    );

    expect(result.goal).toBe("Manage my Meta Ads");
    expect(
      result.items.map((item) =>
        item.kind === "connect_toolkit" ? item.toolkitSlug : item.kind
      )
    ).toEqual(["googledrive", "googlesheets", "metaads"]);
  });

  test("reads the goal from an import with no Help with", async () => {
    const result = await buildSetupChecklist(
      {
        candidates,
        userContext:
          "# About Me\n\n- What you do: I run Facebook ads for a shop\n",
      },
      {
        provider: providerReplying(
          '{"goal":"Run Meta ads for my shop","items":["toolkit:metaads"]}'
        ),
      }
    );

    expect(result.goal).toBe("Run Meta ads for my shop");
    expect(result.items.at(-1)).toMatchObject({ toolkitSlug: "metaads" });
  });

  test("still returns required Google when the provider fails", async () => {
    const result = await buildSetupChecklist(
      { candidates, userContext },
      {
        // SAFETY: This test double only calls generateText, and this is its complete implementation.
        provider: {
          generateText: async () => {
            throw new Error("rate limited");
          },
        } as never,
      }
    );

    expect(result.goal).toBe("Manage my Meta Ads");
    expect(
      result.items.map((item) =>
        item.kind === "connect_toolkit" ? item.toolkitSlug : item.kind
      )
    ).toEqual(["googledrive", "googlesheets"]);
  });
});
