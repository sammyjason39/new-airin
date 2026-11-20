import { describe, expect, test } from "bun:test";
import { createInMemoryDatabaseAdapter } from "@airin/db";
import { OrgPlanUsageService } from "./org-plan-usage-service";

describe("OrgPlanUsageService", () => {
  test("sums current-month spend against Lite trial budget", async () => {
    const db = createInMemoryDatabaseAdapter();
    const now = () => new Date("2026-03-15T12:00:00.000Z");

    const service = new OrgPlanUsageService(
      db,
      async () => [
        { day: "2026-03-01", estimatedCostUsd: 2 },
        { day: "2026-03-10", estimatedCostUsd: 3.5 },
        { day: "2026-02-28", estimatedCostUsd: 99 },
      ],
      now
    );

    const status = await service.getStatus("org_test");

    expect(status.month).toBe("2026-03");
    expect(status.spentUsd).toBeCloseTo(5.5);
    expect(status.budgetUsd).toBe(10);
    expect(status.remainingUsd).toBeCloseTo(4.5);
    expect(status.planName).toBe("Lite (trial)");
    expect(status.status).toBe("ok");
  });

  test("marks warning near budget and blocked at or over", async () => {
    const db = createInMemoryDatabaseAdapter();
    const now = () => new Date("2026-03-15T12:00:00.000Z");

    const warn = await new OrgPlanUsageService(
      db,
      async () => [{ day: "2026-03-01", estimatedCostUsd: 8.5 }],
      now
    ).getStatus("org_warn");

    expect(warn.status).toBe("warning");

    const blocked = await new OrgPlanUsageService(
      db,
      async () => [{ day: "2026-03-01", estimatedCostUsd: 10 }],
      now
    ).getStatus("org_block");

    expect(blocked.status).toBe("blocked");
    expect(blocked.remainingUsd).toBe(0);
  });
});
