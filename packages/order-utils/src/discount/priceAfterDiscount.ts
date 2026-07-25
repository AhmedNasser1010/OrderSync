import type { DiscountObject } from "./types";
import type { User, PriceAfterDiscountResult } from "./types";
import { evaluateConditions } from "./evaluateConditions";
import { isWithinTimeRules } from "./evaluateTimeRules";
import { isDiscountActive } from "./isDiscountActive";

export const priceAfterDiscount = (
  price: number,
  discount: DiscountObject,
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

  let finalPrice = price;

  switch (discount.type) {
    case "FIXED":
      finalPrice = Math.max(0, price - discount.value);
      break;
    case "P":
      finalPrice = price * (1 - discount.value / 100);
      break;
    default:
      finalPrice = price;
      break;
  }

  let isAvailableForUser = false;

  if (discount.conditions.rules.length > 0) {
    isAvailableForUser = evaluateConditions(discount.conditions, user, resId);
  } else {
    isAvailableForUser = true;
  }

  if (!user.restaurants) {
    isAvailableForUser = true;
  }

  return { finalPrice, isAvailableForUser };
};
