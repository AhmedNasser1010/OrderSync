import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import computeEta from "./getEta";

describe("computeEta", () => {
  const NOW = 1_700_000_000_000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("terminal states", () => {
    it("returns arrived (0 min) for DELIVERED", () => {
      const result = computeEta({
        status: "DELIVERED",
        timeline: { deliveredAt: 123 },
      });
      expect(result).toMatchObject({ minutes: 0, minutesMax: 0, kind: "arrived" });
      expect(result.arrivalTime).toBe(123);
    });

    it("returns arrived for GIVEN_FEEDBACK", () => {
      const result = computeEta({ status: "GIVEN_FEEDBACK" });
      expect(result).toMatchObject({ minutes: 0, minutesMax: 0, kind: "arrived" });
    });
  });

  describe("non-trackable states", () => {
    it.each(["CANCELED", "REJECTED", "VOIDED", undefined])(
      "returns no ETA for %s",
      (status) => {
        expect(computeEta({ status })).toEqual({
          minutes: null,
          minutesMax: null,
          arrivalTime: null,
          kind: null,
        });
      }
    );
  });

  describe("en-route phase", () => {
    it("computes ETA from live driver position", () => {
      const result = computeEta({
        status: "ON_ROUTE",
        driverLocation: { lat: 30, lng: 31, speed: 11 },
        deliveryLatlng: [30.01, 31],
      });
      expect(result.kind).toBe("enRoute");
      // 1.11 km × 1.3 correction ÷ 39.6 km/h (11 m/s) ≈ 2.2 min → 2.
      expect(result.minutes).toBe(2);
      expect(result.minutesMax).toBe(2);
      expect(result.arrivalTime).toBe(NOW + 2 * 60_000);
    });

    it("falls back to the default speed when speed is missing or unreliable", () => {
      const slow = computeEta({
        status: "PICKED_UP",
        driverLocation: { lat: 30, lng: 31, speed: 1 },
        deliveryLatlng: [30.01, 31],
      });
      const missing = computeEta({
        status: "RESERVED",
        driverLocation: { lat: 30, lng: 31 },
        deliveryLatlng: [30.01, 31],
      });
      expect(slow.minutes).toBe(4);
      expect(missing.minutes).toBe(4);
    });

    it("never returns an ETA below the 1-minute floor", () => {
      const result = computeEta({
        status: "ON_ROUTE",
        driverLocation: { lat: 30, lng: 31 },
        deliveryLatlng: [30.0001, 31],
      });
      expect(result.minutes).toBe(1);
    });
  });

  describe("pre-driver phase", () => {
    it("estimates prep time + travel when no timestamps exist yet", () => {
      const result = computeEta({
        status: "RECEIVED",
        restaurantLatlng: [30, 31],
        deliveryLatlng: [30.02, 31],
      });
      expect(result.kind).toBe("preparing");
      expect(result.minutes).toBe(23);
      // Without explicit bounds, prepTimeMax defaults to prepTimeMin (no range).
      expect(result.minutesMax).toBe(23);
    });

    it("uses elapsed prep time once preparing has started", () => {
      // preparing started 10 minutes ago; prep bound is 15 min → 5 left.
      const result = computeEta({
        status: "PREPARING",
        timeline: { preparingAt: NOW - 10 * 60_000 },
        restaurantLatlng: [30, 31],
        deliveryLatlng: [30.02, 31],
      });
      expect(result.kind).toBe("preparing");
      expect(result.minutes).toBe(5 + 8);
      expect(result.minutesMax).toBe(5 + 8);
    });

    it("treats prep as finished once readyAt exists", () => {
      const result = computeEta({
        status: "READY",
        timeline: { readyAt: NOW - 60_000 },
        restaurantLatlng: [30, 31],
        deliveryLatlng: [30.02, 31],
      });
      expect(result.minutes).toBe(0 + 8);
      expect(result.minutesMax).toBe(0 + 8);
    });

    it("honors custom prep bounds", () => {
      const result = computeEta({
        status: "ACCEPTED",
        restaurantLatlng: [30, 31],
        deliveryLatlng: [30.02, 31],
        prepTimeMin: 10,
        prepTimeMax: 20,
      });
      expect(result.minutes).toBe(10 + 8);
      expect(result.minutesMax).toBe(20 + 8);
    });
  });

  it("returns null when delivery coordinates are missing", () => {
    expect(
      computeEta({ status: "PREPARING", restaurantLatlng: [30, 31] })
    ).toEqual({
      minutes: null,
      minutesMax: null,
      arrivalTime: null,
      kind: null,
    });
  });
});
