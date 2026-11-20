import {
  getPaidPlan,
  isPaidPlanId,
  type OrgPlanUsageResponse,
  PAID_PLANS,
} from "@airin/core";
import type { DatabaseAdapter } from "@airin/db";

const WARNING_PERCENT = 80;

type DailyCostRow = {
  day: string;
  estimatedCostUsd: number;
};

/**
 * Monthly plan budget vs LLM spend for the Claude Code–style remaining band.
 */
export class OrgPlanUsageService {
  constructor(
    private readonly db: DatabaseAdapter,
    private readonly listDailyCosts: (
      orgId: string
    ) => Promise<readonly DailyCostRow[]>,
    private readonly now: () => Date = () => new Date()
  ) {}

  async getStatus(orgId: string): Promise<OrgPlanUsageResponse> {
    const now = this.now();
    const month = now.toISOString().slice(0, 7);
    const daily = await this.listDailyCosts(orgId);

    const spentUsd = daily
      .filter((row) => row.day.startsWith(month))
      .reduce((sum, row) => sum + row.estimatedCostUsd, 0);

    const subscription = await this.db.getBillingSubscription(orgId);
    const planId = subscription?.planId ?? null;

    if (planId && isPaidPlanId(planId)) {
      const plan = getPaidPlan(planId);

      return finish(month, plan.id, plan.name, plan.tokenBudgetUsd, spentUsd);
    }

    if (planId === "enterprise") {
      return {
        budgetUsd: null,
        month,
        planId: "enterprise",
        planName: "Enterprise",
        remainingUsd: null,
        spentUsd,
        status: "unlimited",
        warningPercent: WARNING_PERCENT,
      };
    }

    // Trial / no row: show Lite budget so owners still see remaining chat.
    const trial = PAID_PLANS.lite;

    return finish(
      month,
      "lite",
      "Lite (trial)",
      trial.tokenBudgetUsd,
      spentUsd
    );
  }
}

function finish(
  month: string,
  planId: string,
  planName: string,
  budgetUsd: number,
  spentUsd: number
): OrgPlanUsageResponse {
  const remainingUsd = Math.max(0, budgetUsd - spentUsd);
  const ratio = budgetUsd > 0 ? spentUsd / budgetUsd : 0;

  const status =
    spentUsd >= budgetUsd
      ? "blocked"
      : ratio >= WARNING_PERCENT / 100
        ? "warning"
        : "ok";

  return {
    budgetUsd,
    month,
    planId,
    planName,
    remainingUsd,
    spentUsd,
    status,
    warningPercent: WARNING_PERCENT,
  };
}
