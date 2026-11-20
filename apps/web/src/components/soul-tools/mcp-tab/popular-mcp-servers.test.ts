import { expect, test } from "bun:test";
import { unregisteredPopularServers } from "@/components/soul-tools/mcp-tab/popular-mcp-servers";

const names = (servers: readonly { name: string }[]) =>
  servers.map((server) => server.name);

test("offers the apps Composio can connect", () => {
  expect(names(unregisteredPopularServers([], [{ slug: "notion" }]))).toEqual([
    "Notion",
    "Higgsfield",
    "Supabase",
  ]);
});

test("keeps apps with their own MCP sign-in when Composio cannot connect them", () => {
  expect(names(unregisteredPopularServers([], []))).toEqual([
    "Notion",
    "Higgsfield",
    "Supabase",
  ]);
});

test("does not offer Canva", () => {
  expect(names(unregisteredPopularServers([], [{ slug: "canva" }]))).toEqual([
    "Notion",
    "Higgsfield",
    "Supabase",
  ]);
});

test("skips an app the org already added as an MCP server", () => {
  expect(
    names(
      unregisteredPopularServers(
        [{ name: "notion" }, { name: "Higgsfield" }, { name: "Supabase" }],
        [{ slug: "notion" }]
      )
    )
  ).toEqual([]);
});
