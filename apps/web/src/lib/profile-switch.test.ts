import { describe, expect, test } from "bun:test";
import { resolveProfileSwitch } from "./profile-switch";

function pick(
  pathname: string,
  search = "",
  activeProfileId = "alpha",
  extras: {
    storedSessionId?: string | null;
    uiMode?: "advanced" | "owner";
  } = {}
) {
  return resolveProfileSwitch({
    activeProfileId,
    pathname,
    profileId: "beta",
    search,
    storedSessionId: extras.storedSessionId,
    uiMode: extras.uiMode,
  });
}

describe("resolveProfileSwitch", () => {
  test("an open session is replaced by a fresh chat for the picked agent", () => {
    expect(pick("/chat/alpha/session-1")).toEqual({
      kind: "navigate",
      replace: true,
      to: "/chat?new=1&profile=beta",
    });
  });

  test("a draft chat swaps to a fresh chat for the picked agent", () => {
    expect(pick("/chat")).toEqual({
      kind: "navigate",
      replace: true,
      to: "/chat?new=1&profile=beta",
    });
  });

  test("the agent already on screen stays put", () => {
    for (const pathname of ["/chat", "/chat/beta/session-1", "/files"]) {
      expect(pick(pathname, "", "beta")).toEqual({ kind: "stay" });
    }

    expect(pick("/profiles", "?profile=beta", "beta")).toEqual({
      kind: "stay",
    });
  });

  test("on Profiles, a blocked deep link is left for the picked agent", () => {
    expect(pick("/profiles", "?profile=hidden", "beta")).toEqual({
      kind: "navigate",
      replace: true,
      to: "/profiles?profile=beta",
    });
  });

  test("the active agent picked outside chat still opens its chat", () => {
    expect(pick("/settings", "", "beta")).toEqual({
      kind: "navigate",
      replace: false,
      to: "/chat?new=1&profile=beta",
    });
  });

  test("Files still swaps the agent in place", () => {
    expect(pick("/files")).toEqual({ kind: "select" });
  });

  test("Owner resumes the stored session for the picked agent", () => {
    expect(
      pick("/chat/alpha/session-1", "", "alpha", {
        storedSessionId: "beta-last",
        uiMode: "owner",
      })
    ).toEqual({
      kind: "navigate",
      replace: true,
      to: "/chat/beta/beta-last",
    });
  });

  test("Owner on draft chat swaps the agent without wiping another session URL", () => {
    expect(
      pick("/chat", "", "alpha", {
        uiMode: "owner",
      })
    ).toEqual({ kind: "select" });
  });

  test("Owner leaves a session for a draft when the agent has no stored chat", () => {
    expect(
      pick("/chat/alpha/session-1", "", "alpha", {
        uiMode: "owner",
      })
    ).toEqual({
      kind: "navigate",
      replace: true,
      to: "/chat",
    });
  });

  test("Owner outside chat opens the stored session when one exists", () => {
    expect(
      pick("/settings", "", "alpha", {
        storedSessionId: "beta-last",
        uiMode: "owner",
      })
    ).toEqual({
      kind: "navigate",
      replace: false,
      to: "/chat/beta/beta-last",
    });
  });
});
