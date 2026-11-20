/**
 * Commercial plans for Airin SaaS (Lite / Plus / Pro + Enterprise sales).
 * Money is whole rupiah. Token budgets are USD-equivalent for the period.
 */

export const BILLING_INTERVALS = ["month", "quarter", "year"] as const;

export type BillingInterval = (typeof BILLING_INTERVALS)[number];

export const PAID_PLAN_IDS = ["lite", "plus", "pro"] as const;

export type PaidPlanId = (typeof PAID_PLAN_IDS)[number];

export const PLAN_IDS = [...PAID_PLAN_IDS, "enterprise"] as const;

export type PlanId = (typeof PLAN_IDS)[number];

export const SUBSCRIPTION_STATUSES = [
  "trial",
  "active",
  "past_due",
  "suspended",
  "cancelled",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const DEFAULT_TRIAL_DAYS = 14;

/** 3-month subscribe gets half the yearly setup hours. */
export const QUARTER_SETUP_RATIO = 0.5;

/**
 * Doku Checkout stays off until credentials + webhook are ready.
 * While false, all public payment CTAs use WhatsApp.
 */
export const DOKU_CHECKOUT_ENABLED = false;

/** Sales / payment WhatsApp (used while Doku is hidden). */
export const BILLING_WHATSAPP = {
  phoneE164: "6287728589845",
  /** Local ID format as provided by sales. */
  phoneLocal: "087728589845",
  waUrl: "https://wa.me/6287728589845",
} as const;

export const ENTERPRISE_CONTACT = {
  template: "Nama PIC :\nNama Perusahaan :\nIndustri :\nInquiry :",
  waUrl: BILLING_WHATSAPP.waUrl,
} as const;

export function billingWhatsAppHref(message: string): string {
  return `${BILLING_WHATSAPP.waUrl}?text=${encodeURIComponent(message)}`;
}

export interface PaidPlanDefinition {
  /** Extra seat price per month (Plus). null = no seat add-on. */
  addOnSeatIdrPerMonth: number | null;
  canAddMembers: boolean;
  dedicatedSupport: boolean;
  /** Lite: UI shows effort only, not a full model picker. */
  effortOnlyModels: boolean;
  id: PaidPlanId;
  includedSeats: number;
  /** Marketing name next to the plan id. */
  label: string;
  /** null = no device cap. */
  maxDevices: number | null;
  name: string;
  priceIdrPerMonth: number;
  /** Full-year setup / consult hours (0 when none). Month = 0; quarter = 50%. */
  setupHoursYear: number;
  /** USD-equivalent token budget for one month. */
  tokenBudgetUsd: number;
  /** Shown on pricing, e.g. "×10" vs Lite. */
  tokenLimitLabel: string;
}

export const PAID_PLANS: Record<PaidPlanId, PaidPlanDefinition> = {
  lite: {
    addOnSeatIdrPerMonth: null,
    canAddMembers: false,
    dedicatedSupport: false,
    effortOnlyModels: true,
    id: "lite",
    includedSeats: 1,
    label: "Solo Founder",
    maxDevices: 2,
    name: "Lite",
    priceIdrPerMonth: 400_000,
    setupHoursYear: 0,
    tokenBudgetUsd: 10,
    tokenLimitLabel: "1×",
  },
  plus: {
    addOnSeatIdrPerMonth: 200_000,
    canAddMembers: true,
    dedicatedSupport: false,
    effortOnlyModels: false,
    id: "plus",
    includedSeats: 3,
    label: "Small Team",
    maxDevices: null,
    name: "Plus",
    priceIdrPerMonth: 2_500_000,
    setupHoursYear: 2,
    tokenBudgetUsd: 60,
    tokenLimitLabel: "×10",
  },
  pro: {
    addOnSeatIdrPerMonth: null,
    canAddMembers: true,
    dedicatedSupport: true,
    effortOnlyModels: false,
    id: "pro",
    includedSeats: 10,
    label: "Big Team",
    maxDevices: null,
    name: "Pro",
    priceIdrPerMonth: 4_500_000,
    setupHoursYear: 10,
    tokenBudgetUsd: 150,
    tokenLimitLabel: "×3",
  },
};

/** Prefill for paid-plan checkout via WhatsApp. */
export function paidPlanWhatsAppTemplate(planId: PaidPlanId): string {
  const plan = PAID_PLANS[planId];

  return [
    `Halo, saya ingin berlangganan Airin ${plan.name}.`,
    "",
    "Nama PIC :",
    "Nama Perusahaan :",
    "Industri :",
    `Paket : ${plan.name} (${plan.label})`,
    "Interval : bulanan / 3 bulan / tahunan",
    "Inquiry : pembayaran",
  ].join("\n");
}

export function isPaidPlanId(value: string): value is PaidPlanId {
  // SAFETY: PaidPlanId is the union of PAID_PLAN_IDS; includes checks membership.
  return (PAID_PLAN_IDS as readonly string[]).includes(value);
}

export function isBillingInterval(value: string): value is BillingInterval {
  // SAFETY: BillingInterval is the union of BILLING_INTERVALS; includes checks membership.
  return (BILLING_INTERVALS as readonly string[]).includes(value);
}

export function getPaidPlan(planId: PaidPlanId): PaidPlanDefinition {
  return PAID_PLANS[planId];
}

/** Months covered by one invoice for the interval. */
export function intervalMonthCount(interval: BillingInterval): number {
  switch (interval) {
    case "month":
      return 1;
    case "quarter":
      return 3;
    case "year":
      return 12;
  }
}

/**
 * Setup hours for a new paid period.
 * Month = 0. Quarter = 50% of yearly hours. Year = full hours.
 */
export function setupHoursForInterval(
  planId: PaidPlanId,
  interval: BillingInterval
): number {
  const yearly = PAID_PLANS[planId].setupHoursYear;

  if (yearly <= 0 || interval === "month") {
    return 0;
  }

  if (interval === "year") {
    return yearly;
  }

  return yearly * QUARTER_SETUP_RATIO;
}

export function extraSeatCount(planId: PaidPlanId, seatCount: number): number {
  const included = PAID_PLANS[planId].includedSeats;

  return Math.max(0, seatCount - included);
}

export interface BillingQuoteLine {
  amountIdr: number;
  description: string;
  planId: PaidPlanId | null;
  proration: boolean;
  quantity: number;
  unitAmountIdr: number;
}

export interface BillingQuote {
  currency: "IDR";
  interval: BillingInterval;
  lines: BillingQuoteLine[];
  planId: PaidPlanId;
  seatCount: number;
  setupHours: number;
  totalIdr: number;
}

/**
 * Server-side quote. Clients never send amounts.
 * Seat count below included seats is raised to included.
 */
export function quotePaidPlan(input: {
  interval: BillingInterval;
  planId: PaidPlanId;
  /** Total seats wanted (must be ≥ included). */
  seatCount?: number;
}): BillingQuote {
  const plan = PAID_PLANS[input.planId];

  const seatCount = Math.max(
    plan.includedSeats,
    input.seatCount ?? plan.includedSeats
  );

  if (!plan.canAddMembers && seatCount > plan.includedSeats) {
    throw new Error("Lite cannot add seats");
  }

  if (plan.addOnSeatIdrPerMonth == null && seatCount > plan.includedSeats) {
    throw new Error(`${plan.name} does not sell extra seats`);
  }

  const months = intervalMonthCount(input.interval);

  const lines: BillingQuoteLine[] = [
    {
      amountIdr: plan.priceIdrPerMonth * months,
      description: `${plan.name} (${plan.label}) · ${months} mo`,
      planId: plan.id,
      proration: false,
      quantity: months,
      unitAmountIdr: plan.priceIdrPerMonth,
    },
  ];

  const extras = extraSeatCount(plan.id, seatCount);

  if (extras > 0 && plan.addOnSeatIdrPerMonth != null) {
    const unit = plan.addOnSeatIdrPerMonth;
    lines.push({
      amountIdr: unit * extras * months,
      description: `Extra seat ×${extras} · ${months} mo`,
      planId: plan.id,
      proration: false,
      quantity: extras * months,
      unitAmountIdr: unit,
    });
  }

  const totalIdr = lines.reduce((sum, line) => sum + line.amountIdr, 0);

  return {
    currency: "IDR",
    interval: input.interval,
    lines,
    planId: plan.id,
    seatCount,
    setupHours: setupHoursForInterval(plan.id, input.interval),
    totalIdr,
  };
}

/** USD budget for the billing period (monthly budget × months). */
export function tokenBudgetUsdForPeriod(
  planId: PaidPlanId,
  interval: BillingInterval
): number {
  return PAID_PLANS[planId].tokenBudgetUsd * intervalMonthCount(interval);
}
