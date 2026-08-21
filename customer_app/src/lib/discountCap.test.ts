import { describe, it, expect } from "vitest";
import {
  calculateDiscountAmount,
  priceAfterDiscount,
} from "@ordersync/order-utils";
import type { DiscountObject } from "@ordersync/types";

const makeDiscount = (overrides: Partial<DiscountObject>): DiscountObject => ({
  id: "d1",
  code: "TEST",
  message: "",
  level: "order",
  type: "P",
  value: 10,
  conditions: { operator: "AND", rules: [] },
  active: true,
  ...overrides,
});

describe("calculateDiscountAmount", () => {
  it("caps percentage discount at maxDiscountValue", () => {
    const discount = makeDiscount({ type: "P", value: 10, maxDiscountValue: 50 });
    expect(calculateDiscountAmount(10000, discount)).toBe(50);
  });

  it("does not cap when percentage is below the max", () => {
    const discount = makeDiscount({ type: "P", value: 10, maxDiscountValue: 50 });
    expect(calculateDiscountAmount(300, discount)).toBe(30);
  });

  it("returns full percentage when no max is set", () => {
    const discount = makeDiscount({ type: "P", value: 10 });
    expect(calculateDiscountAmount(10000, discount)).toBe(1000);
  });

  it("ignores zero or negative max values", () => {
    const discount = makeDiscount({ type: "P", value: 10, maxDiscountValue: 0 });
    expect(calculateDiscountAmount(10000, discount)).toBe(1000);
  });

  it("never exceeds the base amount", () => {
    const discount = makeDiscount({ type: "FIXED", value: 500 });
    expect(calculateDiscountAmount(300, discount)).toBe(300);
  });

  it("keeps fixed discounts unchanged", () => {
    const discount = makeDiscount({ type: "FIXED", value: 20 });
    expect(calculateDiscountAmount(100, discount)).toBe(20);
  });
});

describe("priceAfterDiscount with maxDiscountValue", () => {
  const user = { uid: "u1" };

  it("caps per-unit item discount", () => {
    const discount = makeDiscount({
      level: "item",
      type: "P",
      value: 10,
      maxDiscountValue: 50,
    });
    const result = priceAfterDiscount(10000, discount, user, "res1");
    expect(result.finalPrice).toBe(9950);
  });

  it("applies plain percentage when under the cap", () => {
    const discount = makeDiscount({
      level: "item",
      type: "P",
      value: 10,
      maxDiscountValue: 50,
    });
    const result = priceAfterDiscount(200, discount, user, "res1");
    expect(result.finalPrice).toBe(180);
  });
});
