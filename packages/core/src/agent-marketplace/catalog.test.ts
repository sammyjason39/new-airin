import { describe, expect, test } from "bun:test";
import {
  AGENT_MARKETPLACE_CORE_PACK,
  getAgentMarketplaceEntry,
  listAgentMarketplaceCatalog,
} from "./catalog";

describe("agent marketplace catalog", () => {
  test("ships ten core agents with unique ids", () => {
    const list = listAgentMarketplaceCatalog();
    expect(list).toHaveLength(10);
    expect(new Set(list.map((entry) => entry.id)).size).toBe(10);
    expect(getAgentMarketplaceEntry("hr-indonesia")?.name).toBe("Alya");
    expect(getAgentMarketplaceEntry("hr-indonesia")?.bundledSkillNames).toEqual(
      ["hr-uu-ketenagakerjaan"]
    );
    expect(getAgentMarketplaceEntry("hr-recruiting")?.name).toBe("Maya");
    expect(getAgentMarketplaceEntry("hr-payroll")?.name).toBe("Rani");
    expect(getAgentMarketplaceEntry("chief-of-staff")?.name).toBe("Jovan");
    expect(getAgentMarketplaceEntry("chief-of-staff")?.characterId).toBe(
      "jovan"
    );
    expect(getAgentMarketplaceEntry("sales")?.bundledSkillNames).toEqual([
      "research-sheet-manager",
      "tapinall-research",
    ]);
    expect(getAgentMarketplaceEntry("sales")?.composioApps).toEqual([
      "gmail",
      "googledrive",
      "googlesheets",
    ]);
    expect(
      getAgentMarketplaceEntry("hr-recruiting")?.bundledSkillNames
    ).toEqual(["research-sheet-manager", "tapinall-research"]);
    expect(getAgentMarketplaceEntry("hr-recruiting")?.composioApps).toEqual([
      "gmail",
      "googledrive",
      "googlesheets",
    ]);
    expect(getAgentMarketplaceEntry("social-media")?.bundledSkillNames).toEqual(
      ["research-sheet-manager", "tapinall-research"]
    );
    expect(getAgentMarketplaceEntry("social-media")?.composioApps).toEqual([
      "instagram",
      "gmail",
      "googledrive",
      "googlesheets",
    ]);
    expect(
      AGENT_MARKETPLACE_CORE_PACK.every(
        (entry) => entry.soul.length > 0 && entry.characterId.length > 0
      )
    ).toBe(true);
  });
});
