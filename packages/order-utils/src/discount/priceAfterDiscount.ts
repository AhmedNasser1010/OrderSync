import type { DiscountObject } from "./types";
import type { User, PriceAfterDiscountResult } from "./types";
import { evaluateConditions } from "./evaluateConditions";
import { isWithinTimeRules } from "./evaluateTimeRules";
import { isDiscountActive } from "./isDiscountActive";
import { evaluateSegments } from "./evaluateSegments";
import { calculateDiscountAmount } from "./discountAmount";

export const priceAfterDiscount = (
  price: number,
  discount: DiscountObject | null | undefined,
  user: User,
  resId: string
): PriceAfterDiscountResult => {
  if (!discount) return { finalPrice: price, isAvailableForUser: false };

  if (!isDiscountActive(discount)) {
    return { finalPrice: price, isAvailableForUser: false };
  }

  if (!isWithinTimeRules(discount.timeRules)) {
    return { finalPrice: price, isAvailableForUser: false };
  }

  const finalPrice = price - calculateDiscountAmount(price, discount);

  let isAvailableForUser = false;

  if (discount.conditions.rules.length > 0) {
    isAvailableForUser = evaluateConditions(discount.conditions, user, resId);
  } else {
    isAvailableForUser = true;
  }

  if (!user.restaurants) {
    isAvailableForUser = true;
  }

  if (isAvailableForUser && !evaluateSegments(discount.segments ?? [], user, resId)) {
    isAvailableForUser = false;
  }

  return { finalPrice, isAvailableForUser };
};
