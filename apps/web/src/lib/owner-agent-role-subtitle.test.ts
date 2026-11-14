import { describe, expect, test } from "bun:test";
import {
  agentRailHoverLabel,
  laundryAgentRoleMessageKey,
  marketplaceAgentRoleMessageKey,
  ownerAgentSubtitleMessageKey,
} from "./owner-agent-role-subtitle";

describe("ownerAgentSubtitleMessageKey", () => {
  test("maps laundry profile ids to role keys", () => {
    expect(
      ownerAgentSubtitleMessageKey({
        id: "laundry_social",
        isSuper: false,
        name: "Sari",
      })
    ).toBe("owner.role.laundrySocial");
    expect(
      ownerAgentSubtitleMessageKey({
        id: "laundry_ops",
        isSuper: false,
        name: "Toni",
      })
    ).toBe("owner.role.laundryOps");
  });

  test("maps legacy display names when id is unknown", () => {
    expect(
      laundryAgentRoleMessageKey({
        id: "legacy-social",
        isSuper: false,
        name: "Social",
      })
    ).toBe("owner.role.laundrySocial");
  });

  test("maps marketplace agents to role keys", () => {
    expect(
      marketplaceAgentRoleMessageKey({
        id: "hr-indonesia",
        isSuper: false,
        name: "Alya",
      })
    ).toBe("owner.role.hr");
    expect(
      ownerAgentSubtitleMessageKey({
        id: "custom-alya",
        isSuper: false,
        name: "Alya",
      })
    ).toBe("owner.role.hr");
  });

  test("uses orchestrator label for super agents", () => {
    expect(
      ownerAgentSubtitleMessageKey({
        id: "super",
        isSuper: true,
        name: "Boss",
      })
    ).toBe("owner.orchestrator");
  });

  test("maps Default Bot to assistant instead of generic agent", () => {
    expect(
      ownerAgentSubtitleMessageKey({
        id: "hz2lOuDwXX5BodkrxAY7G",
        isSuper: false,
        name: "Default Bot",
      })
    ).toBe("owner.role.assistant");
  });

  test("falls back to generic agent label", () => {
    expect(
      ownerAgentSubtitleMessageKey({
        id: "custom-bot",
        isSuper: false,
        name: "Helper",
      })
    ).toBe("owner.agent");
  });

  test("formats advanced rail hover with role", () => {
    expect(
      agentRailHoverLabel(
        { id: "hr-indonesia", isSuper: false, name: "Alya" },
        "HR"
      )
    ).toBe("Alya · HR");
  });
});
