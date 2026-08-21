import type { DiscountObject } from "./types";

export const calculateDiscountAmount = (
  base: number,
  discount: DiscountObject
): number => {
  let amount: number;
  switch (discount.type) {
    case "P":
      amount = base * (discount.value / 100);
      break;
    case "FIXED":
      amount = discount.value;
      break;
    default:
      return 0;
  }
  if (discount.maxDiscountValue != null && discount.maxDiscountValue > 0) {
    amount = Math.min(amount, discount.maxDiscountValue);
  }
  return Math.min(amount, base);
};
