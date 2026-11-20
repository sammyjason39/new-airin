import { describe, expect, test } from "bun:test";
import {
  BILLING_WHATSAPP,
  billingWhatsAppHref,
  DEFAULT_TRIAL_DAYS,
  DOKU_CHECKOUT_ENABLED,
  ENTERPRISE_CONTACT,
  extraSeatCount,
  PAID_PLANS,
  paidPlanWhatsAppTemplate,
  quotePaidPlan,
  setupHoursForInterval,
  tokenBudgetUsdForPeriod,
} from "./plans";

describe("paid plan catalog", () => {
  test("locks Lite / Plus / Pro commercial numbers", () => {
    expect(PAID_PLANS.lite.priceIdrPerMonth).toBe(400_000);
    expect(PAID_PLANS.lite.includedSeats).toBe(1);
    expect(PAID_PLANS.lite.maxDevices).toBe(2);
    expect(PAID_PLANS.lite.tokenBudgetUsd).toBe(10);
    expect(PAID_PLANS.lite.canAddMembers).toBe(false);
    expect(PAID_PLANS.lite.effortOnlyModels).toBe(true);

    expect(PAID_PLANS.plus.priceIdrPerMonth).toBe(2_500_000);
    expect(PAID_PLANS.plus.includedSeats).toBe(3);
    expect(PAID_PLANS.plus.addOnSeatIdrPerMonth).toBe(200_000);
    expect(PAID_PLANS.plus.tokenBudgetUsd).toBe(60);
    expect(PAID_PLANS.plus.setupHoursYear).toBe(2);

    expect(PAID_PLANS.pro.priceIdrPerMonth).toBe(4_500_000);
    expect(PAID_PLANS.pro.includedSeats).toBe(10);
    expect(PAID_PLANS.pro.tokenBudgetUsd).toBe(150);
    expect(PAID_PLANS.pro.setupHoursYear).toBe(10);
    expect(PAID_PLANS.pro.dedicatedSupport).toBe(true);
  });

  test("token budgets and pricing labels match the commercial lock", () => {
    // Absolute USD wins over the marketing multipliers (×10 / ×3 on the page).
    expect(PAID_PLANS.lite.tokenBudgetUsd).toBe(10);
    expect(PAID_PLANS.plus.tokenBudgetUsd).toBe(60);
    expect(PAID_PLANS.pro.tokenBudgetUsd).toBe(150);
    expect(PAID_PLANS.plus.tokenLimitLabel).toBe("×10");
    expect(PAID_PLANS.pro.tokenLimitLabel).toBe("×3");
  });

  test("default trial is 14 days", () => {
    expect(DEFAULT_TRIAL_DAYS).toBe(14);
  });

  test("billing WhatsApp is 087728589845; Doku stays off", () => {
    expect(DOKU_CHECKOUT_ENABLED).toBe(false);
    expect(BILLING_WHATSAPP.phoneLocal).toBe("087728589845");
    expect(BILLING_WHATSAPP.waUrl).toBe("https://wa.me/6287728589845");
    expect(ENTERPRISE_CONTACT.waUrl).toBe(BILLING_WHATSAPP.waUrl);
    expect(ENTERPRISE_CONTACT.template).toContain("Nama PIC");
    expect(paidPlanWhatsAppTemplate("plus")).toContain("Plus");
    expect(billingWhatsAppHref("halo")).toContain(
      "https://wa.me/6287728589845?text="
    );
  });
});

describe("setupHoursForInterval", () => {
  test("month gets no setup; quarter 50%; year full", () => {
    expect(setupHoursForInterval("plus", "month")).toBe(0);
    expect(setupHoursForInterval("plus", "quarter")).toBe(1);
    expect(setupHoursForInterval("plus", "year")).toBe(2);

    expect(setupHoursForInterval("pro", "month")).toBe(0);
    expect(setupHoursForInterval("pro", "quarter")).toBe(5);
    expect(setupHoursForInterval("pro", "year")).toBe(10);

    expect(setupHoursForInterval("lite", "year")).toBe(0);
  });
});

describe("quotePaidPlan", () => {
  test("quotes Plus monthly base", () => {
    const quote = quotePaidPlan({ interval: "month", planId: "plus" });
    expect(quote.totalIdr).toBe(2_500_000);
    expect(quote.setupHours).toBe(0);
    expect(quote.seatCount).toBe(3);
  });

  test("quotes Plus with extra seats for a quarter", () => {
    const quote = quotePaidPlan({
      interval: "quarter",
      planId: "plus",
      seatCount: 5,
    });

    // base 2.5M × 3 + 200k × 2 extras × 3
    expect(quote.totalIdr).toBe(2_500_000 * 3 + 200_000 * 2 * 3);
    expect(quote.setupHours).toBe(1);
    expect(extraSeatCount("plus", 5)).toBe(2);
  });

  test("quotes yearly Pro", () => {
    const quote = quotePaidPlan({ interval: "year", planId: "pro" });
    expect(quote.totalIdr).toBe(4_500_000 * 12);
    expect(quote.setupHours).toBe(10);
    expect(tokenBudgetUsdForPeriod("pro", "year")).toBe(150 * 12);
  });

  test("rejects Lite seat add", () => {
    expect(() =>
      quotePaidPlan({ interval: "month", planId: "lite", seatCount: 2 })
    ).toThrow();
  });
});
