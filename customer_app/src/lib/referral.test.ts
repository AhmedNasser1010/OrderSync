import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  captureReferralParam,
  getStoredReferral,
  clearStoredReferral,
} from "./referral";

const STORAGE_KEY = "ordersync_ref";

describe("referral capture", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stores a valid ?ref param from the URL", () => {
    vi.stubGlobal("location", {
      search: "?ref=AbC123_xz-9",
    });
    captureReferralParam();
    expect(getStoredReferral()).toBe("AbC123_xz-9");
  });

  it("ignores a missing or empty ref param", () => {
    vi.stubGlobal("location", { search: "" });
    captureReferralParam();
    expect(getStoredReferral()).toBe("");
  });

  it("rejects unsafe referral strings", () => {
    vi.stubGlobal("location", { search: "?ref=<script>alert(1)</script>" });
    captureReferralParam();
    expect(getStoredReferral()).toBe("");
  });

  it("keeps the first captured referral", () => {
    vi.stubGlobal("location", { search: "?ref=firstReferrer123" });
    captureReferralParam();
    vi.stubGlobal("location", { search: "?ref=secondReferrer456" });
    captureReferralParam();
    expect(getStoredReferral()).toBe("firstReferrer123");
  });

  it("clearStoredReferral empties the stored value", () => {
    localStorage.setItem(STORAGE_KEY, "someReferrer");
    clearStoredReferral();
    expect(getStoredReferral()).toBe("");
  });
});