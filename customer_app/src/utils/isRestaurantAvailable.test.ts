import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import isRestaurantAvailable from "./isRestaurantAvailable";
import type { BusinessDocument } from "@ordersync/types";

type OpeningHours = BusinessDocument["operations"]["openingHours"];

const OPEN_HOURS: OpeningHours = {
  sunday: { start: "10:00", end: "22:00", closed: false },
  monday: { start: "10:00", end: "22:00", closed: false },
  tuesday: { start: "10:00", end: "22:00", closed: false },
  wednesday: { start: "10:00", end: "22:00", closed: false },
  thursday: { start: "10:00", end: "22:00", closed: false },
  friday: { start: "10:00", end: "22:00", closed: false },
  saturday: { start: "10:00", end: "22:00", closed: false },
};

describe("isRestaurantAvailable", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 11, 12, 0, 0)); // Sunday noon
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("treats a busy restaurant as available", () => {
    expect(
      isRestaurantAvailable({ status: "busy", openingHours: OPEN_HOURS })
    ).toBe(true);
  });

  it("returns false for any non-active status", () => {
    expect(
      isRestaurantAvailable({ status: "pause", openingHours: OPEN_HOURS })
    ).toBe(false);
    expect(
      isRestaurantAvailable({ status: "inactive", openingHours: OPEN_HOURS })
    ).toBe(false);
    expect(
      isRestaurantAvailable({ status: "hidden", openingHours: OPEN_HOURS })
    ).toBe(false);
    expect(isRestaurantAvailable({ openingHours: OPEN_HOURS })).toBe(false);
  });

  it("returns true for an active restaurant during open hours", () => {
    expect(
      isRestaurantAvailable({ status: "active", openingHours: OPEN_HOURS })
    ).toBe(true);
  });

  it("returns false for an active restaurant outside working hours", () => {
    vi.setSystemTime(new Date(2026, 0, 11, 23, 0, 0));
    expect(
      isRestaurantAvailable({ status: "active", openingHours: OPEN_HOURS })
    ).toBe(false);
  });

  it("returns true when openNowUntil overrides the schedule", () => {
    vi.setSystemTime(new Date(2026, 0, 11, 23, 0, 0));
    expect(
      isRestaurantAvailable({
        status: "active",
        openingHours: OPEN_HOURS,
        openNowUntil: Date.now() + 3_600_000,
      })
    ).toBe(true);
  });
});
