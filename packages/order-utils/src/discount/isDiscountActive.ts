import type { DiscountObject } from "./types";

export const isDiscountActive = (discount: DiscountObject): boolean => {
  if (!discount.active) return false;

  const now = Date.now();
  if (discount.startAt && now < discount.startAt) return false;
  if (discount.expireAt && now > discount.expireAt) return false;

  return true;
};
