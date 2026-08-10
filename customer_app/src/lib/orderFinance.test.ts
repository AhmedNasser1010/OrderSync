import { describe, it, expect } from "vitest";
import {
  calculateOrderFinance,
  DEFAULT_COMMISSION_PERCENT,
} from "@ordersync/order-utils";

describe("calculateOrderFinance", () => {
  it("computes the full finance breakdown with a custom rate", () => {
    const result = calculateOrderFinance({
      subtotal: 200,
      discount: 20,
      deliveryFees: 5,
      total: 185,
      commissionPercent: 10,
    });

    expect(result).toEqual({
      commissionPercent: 10,
      commissionAmount: 18,
      restaurantShare: 162,
      companyShare: 18,
      cashCollected: 185,
      driverEarnings: 5,
    });
  });

  it("uses the default commission rate when none is provided", () => {
    const result = calculateOrderFinance({
      subtotal: 100,
      discount: 0,
      deliveryFees: 5,
      total: 105,
    });

    expect(result.commissionPercent).toBe(DEFAULT_COMMISSION_PERCENT);
    expect(result.commissionAmount).toBe(10);
    expect(result.restaurantShare).toBe(90);
    expect(result.driverEarnings).toBe(5);
    expect(result.cashCollected).toBe(105);
  });

  it("charges commission on food revenue only, not delivery fees", () => {
    const result = calculateOrderFinance({
      subtotal: 100,
      discount: 0,
      deliveryFees: 30,
      total: 130,
      commissionPercent: 10,
    });

    expect(result.commissionAmount).toBe(10);
    expect(result.driverEarnings).toBe(30);
    expect(result.restaurantShare).toBe(90);
  });

  it("rounds commission and net to two decimals", () => {
    const result = calculateOrderFinance({
      subtotal: 99.99,
      discount: 0,
      deliveryFees: 5,
      total: 104.99,
      commissionPercent: 10,
    });

    expect(result.commissionAmount).toBe(10);
    expect(result.restaurantShare).toBe(89.99);
    expect(result.companyShare).toBe(10);
  });

  it("never produces a negative restaurant share", () => {
    const result = calculateOrderFinance({
      subtotal: 50,
      discount: 100,
      deliveryFees: 5,
      total: 0,
      commissionPercent: 50,
    });

    expect(result.commissionAmount).toBe(0);
    expect(result.restaurantShare).toBe(0);
    expect(result.cashCollected).toBe(0);
  });

  it("handles a zero commission rate", () => {
    const result = calculateOrderFinance({
      subtotal: 120,
      discount: 20,
      deliveryFees: 5,
      total: 105,
      commissionPercent: 0,
    });

    expect(result.commissionAmount).toBe(0);
    expect(result.restaurantShare).toBe(100);
    expect(result.companyShare).toBe(0);
  });
});
