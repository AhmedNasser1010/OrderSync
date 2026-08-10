import { describe, it, expect } from "vitest";
import getDeliveryFees from "./getDeliveryFees";

describe("getDeliveryFees", () => {
  it("charges perKm * distance", () => {
    expect(getDeliveryFees(10)).toBe(35);
    expect(getDeliveryFees(2)).toBe(7);
  });

  it("applies the minimum fee when below the threshold", () => {
    expect(getDeliveryFees(0.5)).toBe(5);
    expect(getDeliveryFees(undefined)).toBe(5);
  });

  it("uses custom perKm and min from the config", () => {
    expect(getDeliveryFees(4, { perKm: 2, min: 10 })).toBe(10);
    expect(getDeliveryFees(10, { perKm: 2, min: 10 })).toBe(20);
  });

  it("rounds the result and clamps below the minimum", () => {
    // 3.5 × 1.2345 ≈ 4.32, but the 5 LE minimum applies first.
    expect(getDeliveryFees(1.2345)).toBe(5);
    // 3.5 × 1.6 = 5.6 → rounds to 6.
    expect(getDeliveryFees(1.6)).toBe(6);
    // 3.5 × 1.86 = 6.51 → rounds to 7.
    expect(getDeliveryFees(1.86)).toBe(7);
  });

  it("respects a partial config (perKm only)", () => {
    expect(getDeliveryFees(2, { perKm: 4 })).toBe(8);
  });

  it("respects a partial config (min only)", () => {
    expect(getDeliveryFees(0.1, { min: 20 })).toBe(20);
  });
});
