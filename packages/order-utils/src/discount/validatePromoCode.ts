import type { PromoCode, PromoCodeValidationResult, User } from "./types";
import { isDiscountActive } from "./isDiscountActive";
import { evaluateConditions } from "./evaluateConditions";
import { isWithinTimeRules } from "./evaluateTimeRules";
import { checkUsageLimits } from "./checkUsageLimits";

interface ValidatePromoCodeInput {
  promoCode: PromoCode;
  user: User;
  resId: string;
  cartTotal: number;
  cartItemCount: number;
  userRedemptionCount: number;
}

export const validatePromoCode = ({
  promoCode,
  user,
  resId,
  cartTotal,
  cartItemCount,
  userRedemptionCount,
}: ValidatePromoCodeInput): PromoCodeValidationResult => {
  if (!promoCode.active) {
    return { valid: false, error: "promo_inactive" };
  }

  if (!isDiscountActive(promoCode as any)) {
    return { valid: false, error: "promo_expired" };
  }

  if (!isWithinTimeRules(null)) {
    return { valid: false, error: "promo_not_available_now" };
  }

  if (promoCode.restaurantId !== resId) {
    return { valid: false, error: "promo_wrong_restaurant" };
  }

  if (
    promoCode.minOrderTotal != null &&
    cartTotal < promoCode.minOrderTotal
  ) {
    return {
      valid: false,
      error: `promo_min_order_${promoCode.minOrderTotal}`,
    };
  }

  if (
    promoCode.minCartItems != null &&
    cartItemCount < promoCode.minCartItems
  ) {
    return {
      valid: false,
      error: `promo_min_items_${promoCode.minCartItems}`,
    };
  }

  if (!evaluateConditions(promoCode.conditions, user, resId)) {
    return { valid: false, error: "promo_conditions_not_met" };
  }

  const usageCheck = checkUsageLimits(promoCode, userRedemptionCount);
  if (!usageCheck.allowed) {
    return {
      valid: false,
      error:
        usageCheck.reason === "usage_limit_reached"
          ? "promo_usage_limit_reached"
          : "promo_per_user_limit_reached",
    };
  }

  return { valid: true, promoCode };
};
