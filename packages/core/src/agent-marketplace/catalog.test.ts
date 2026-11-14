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
    expect(
      AGENT_MARKETPLACE_CORE_PACK.every(
        (entry) => entry.soul.length > 0 && entry.characterId.length > 0
      )
    ).toBe(true);
  });
});
