import { describe, it, expect } from "vitest";
import getDistanceFromLatlngInKm from "./getDistanceFromLatlngInKm";

describe("getDistanceFromLatlngInKm", () => {
  it("returns 0 for the same coordinates", () => {
    expect(getDistanceFromLatlngInKm([30, 31], [30, 31])).toBe(0);
  });

  it("computes a known inter-city distance (NYC → LA ~3936 km)", () => {
    const km = getDistanceFromLatlngInKm([40.7128, -74.006], [34.0522, -118.2437]);
    expect(km).toBeCloseTo(3935.746, 1);
  });

  it("computes a short local distance (Cairo → Giza ~6.8 km)", () => {
    const km = getDistanceFromLatlngInKm([30.0444, 31.2357], [29.987, 31.2118]);
    expect(km).toBeCloseTo(6.785, 2);
  });

  it("is symmetric", () => {
    const a = [30.0444, 31.2357];
    const b = [29.987, 31.2118];
    expect(getDistanceFromLatlngInKm(a, b)).toBeCloseTo(
      getDistanceFromLatlngInKm(b, a),
      10
    );
  });
});
