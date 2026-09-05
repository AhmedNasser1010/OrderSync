import { describe, it, expect } from "vitest";
import {
  isReferralFirstOrder,
  getReferredBy,
  shouldCreditReferral,
} from "@ordersync/order-utils";

describe("referral attribution", () => {
  describe("isReferralFirstOrder", () => {
    it("is true only when isFirstOrder is exactly true", () => {
      expect(isReferralFirstOrder({ isFirstOrder: true })).toBe(true);
      expect(isReferralFirstOrder({ isFirstOrder: false })).toBe(false);
      expect(isReferralFirstOrder({})).toBe(false);
      expect(isReferralFirstOrder(null)).toBe(false);
      expect(isReferralFirstOrder(undefined)).toBe(false);
    });
  });

  describe("getReferredBy", () => {
    it("returns a trimmed referredBy string", () => {
      expect(getReferredBy({ referredBy: " refUid " })).toBe("refUid");
      expect(getReferredBy({})).toBe("");
      expect(getReferredBy({ referredBy: 42 as never })).toBe("");
      expect(getReferredBy(null)).toBe("");
    });
  });

  describe("shouldCreditReferral", () => {
    const base = {
      customerUid: "newCustomerUid",
      referral: { isFirstOrder: true, referredBy: "referrerUid" },
      referrerExists: true,
    };

    it("credits the referrer on the referred customer's first order", () => {
      expect(shouldCreditReferral(base)).toBe(true);
    });

    it("does not credit when it is not the first order", () => {
      expect(
        shouldCreditReferral({
          ...base,
          referral: { isFirstOrder: false, referredBy: "referrerUid" },
        })
      ).toBe(false);
    });

    it("does not credit when there is no referrer", () => {
      expect(
        shouldCreditReferral({
          ...base,
          referral: { isFirstOrder: true, referredBy: "" },
        })
      ).toBe(false);
    });

    it("does not credit self-referrals", () => {
      expect(
        shouldCreditReferral({
          ...base,
          customerUid: "sameUid",
          referral: { isFirstOrder: true, referredBy: "sameUid" },
        })
      ).toBe(false);
    });

    it("does not credit when the referrer document does not exist", () => {
      expect(shouldCreditReferral({ ...base, referrerExists: false })).toBe(
        false
      );
    });

    it("does not credit customers with no referral data (legacy docs)", () => {
      expect(shouldCreditReferral({ ...base, referral: undefined })).toBe(
        false
      );
    });
  });
});