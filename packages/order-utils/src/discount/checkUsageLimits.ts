import type { DiscountObject, PromoCode } from "./types";

export const checkUsageLimits = (
  discount: DiscountObject | PromoCode,
  userRedemptionCount: number
): { allowed: boolean; reason?: string } => {
  if (
    discount.usageLimit != null &&
    discount.usageLimit !== undefined &&
    (discount.usageCount ?? 0) >= discount.usageLimit
  ) {
    return { allowed: false, reason: "usage_limit_reached" };
  }

  if (
    discount.perUserLimit != null &&
    discount.perUserLimit !== undefined &&
    userRedemptionCount >= discount.perUserLimit
  ) {
    return { allowed: false, reason: "per_user_limit_reached" };
  }

  return { allowed: true };
};
