import { describe, expect, test } from "bun:test";
import {
  formatSubscriptionInvoiceNumber,
  utcYearMonth,
} from "./invoice-number";

describe("formatSubscriptionInvoiceNumber", () => {
  test("builds SUB-YYYYMM-NNNNNN", () => {
    expect(
      formatSubscriptionInvoiceNumber(new Date("2026-11-19T12:00:00Z"), 1)
    ).toBe("SUB-202611-000001");
    expect(
      formatSubscriptionInvoiceNumber(new Date("2026-01-01T00:00:00Z"), 42)
    ).toBe("SUB-202601-000042");
  });

  test("utcYearMonth matches the reference prefix month", () => {
    expect(utcYearMonth(new Date("2026-11-19T12:00:00Z"))).toBe("202611");
  });
});
