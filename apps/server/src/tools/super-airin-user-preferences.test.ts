import { describe, expect, test } from "bun:test";
import type { ProfileService } from "../services/profile-service";
import { SuperAirinSessionState } from "../services/super-airin-session-state";
import { createSuperAirinTools } from "./super-airin-tools";

describe("super airin user preferences tools", () => {
  test("get_user_preferences returns language and timezone", async () => {
    const tools = createSuperAirinTools(
      {} as ProfileService,
      new SuperAirinSessionState(),
      undefined,
      undefined,
      {
        getUserLanguage: async () => "id",
        getUserTimezone: async () => "Asia/Jakarta",
      }
    );

    const tool = tools.find((entry) => entry.name === "get_user_preferences");

    expect(tool).toBeDefined();
    expect(await tool!.run({}, {})).toEqual({
      language: "id",
      timezone: "Asia/Jakarta",
    });
  });

  test("set_user_language saves id or en", async () => {
    const calls: string[] = [];

    const tools = createSuperAirinTools(
      {} as ProfileService,
      new SuperAirinSessionState(),
      undefined,
      undefined,
      {
        setUserLanguage: async (language) => {
          calls.push(language);

          return language === "en" ? "en" : "id";
        },
      }
    );

    const tool = tools.find((entry) => entry.name === "set_user_language");

    expect(tool).toBeDefined();
    expect(await tool!.run({ language: "en" }, {})).toMatchObject({
      language: "en",
    });
    expect(calls).toEqual(["en"]);
  });

  test("set_user_language rejects unknown codes", async () => {
    const tools = createSuperAirinTools(
      {} as ProfileService,
      new SuperAirinSessionState(),
      undefined,
      undefined,
      {
        setUserLanguage: async () => "id",
      }
    );

    const tool = tools.find((entry) => entry.name === "set_user_language")!;

    await expect(tool.run({ language: "fr" }, {})).rejects.toThrow();
  });

  test("set_user_timezone saves the IANA zone", async () => {
    const tools = createSuperAirinTools(
      {} as ProfileService,
      new SuperAirinSessionState(),
      undefined,
      undefined,
      {
        setUserTimezone: async (timezone) => timezone,
      }
    );

    const tool = tools.find((entry) => entry.name === "set_user_timezone")!;

    expect(await tool.run({ timezone: "America/New_York" }, {})).toEqual({
      timezone: "America/New_York",
    });
  });
});
