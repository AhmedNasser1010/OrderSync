import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import workingDaysChecker from "./workingDaysChecker";
import type { BusinessDocument } from "@ordersync/types";

type OpeningHours = BusinessDocument["operations"]["openingHours"];

const OPEN_SUNDAY_10_TO_22: OpeningHours = {
  sunday: { start: "10:00", end: "22:00", closed: false },
  monday: { start: "10:00", end: "22:00", closed: false },
  tuesday: { start: "10:00", end: "22:00", closed: false },
  wednesday: { start: "10:00", end: "22:00", closed: false },
  thursday: { start: "10:00", end: "22:00", closed: false },
  friday: { start: "10:00", end: "22:00", closed: false },
  saturday: { start: "10:00", end: "22:00", closed: false },
};

const CLOSED_SUNDAY: OpeningHours = {
  ...OPEN_SUNDAY_10_TO_22,
  sunday: { start: "10:00", end: "22:00", closed: true },
};

describe("workingDaysChecker", () => {
  // Sunday 2026-01-11 12:00 local.
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 11, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true when strictly online", () => {
    expect(workingDaysChecker(undefined, true)).toBe(true);
  });

  it("returns false when strictly offline", () => {
    expect(workingDaysChecker(OPEN_SUNDAY_10_TO_22, false)).toBe(false);
  });

  it("returns true when openNowUntil is in the future", () => {
    expect(
      workingDaysChecker(undefined, undefined, Date.now() + 60_000)
    ).toBe(true);
  });

  it("falls through to working hours when openNowUntil is in the past", () => {
    expect(
      workingDaysChecker(undefined, undefined, Date.now() - 60_000)
    ).toBe(null);
  });

  it("returns null when working hours are unknown", () => {
    expect(workingDaysChecker(undefined)).toBe(null);
  });

  it("returns true during an open session", () => {
    expect(workingDaysChecker(OPEN_SUNDAY_10_TO_22)).toBe(true);
  });

  it("returns false on a closed day", () => {
    expect(workingDaysChecker(CLOSED_SUNDAY)).toBe(false);
  });
});
