import type { DiscountObject } from "./types";
import type { User } from "./types";
import { isDiscountActive } from "./isDiscountActive";
import { evaluateConditions } from "./evaluateConditions";
import { isWithinTimeRules } from "./evaluateTimeRules";
import { applyStackingRules } from "./applyStackingRules";
import { evaluateSegments } from "./evaluateSegments";

interface CartItem {
  price: number;
  quantity: number;
  finalPrice?: number;
}

export const applyOrderDiscounts = (
  cartItems: CartItem[],
  orderDiscounts: DiscountObject[],
  user: User,
  resId: string
): DiscountObject[] => {
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.finalPrice ?? item.price) * item.quantity,
    0
  );
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const eligible = orderDiscounts.filter((discount) => {
    if (!isDiscountActive(discount)) return false;
    if (!isWithinTimeRules(discount.timeRules)) return false;
    if (discount.minOrderTotal && cartTotal < discount.minOrderTotal) return false;
    if (discount.minCartItems && cartItemCount < discount.minCartItems) return false;
    if (!evaluateConditions(discount.conditions, user, resId)) return false;
    if (!evaluateSegments(discount.segments ?? [], user, resId)) return false;
    return true;
  });

  return applyStackingRules(eligible, cartTotal);
};

export const calculateOrderDiscount = (
  cartTotal: number,
  discount: DiscountObject
): number => {
  switch (discount.type) {
    case "FIXED":
      return Math.max(0, cartTotal - discount.value);
    case "P":
      return cartTotal * (1 - discount.value / 100);
    default:
      return cartTotal;
  }
};
