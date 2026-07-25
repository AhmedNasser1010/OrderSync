import type { DiscountObject } from "./types";
import { isDiscountActive } from "./isDiscountActive";
import { isWithinTimeRules } from "./evaluateTimeRules";

interface ItemWithDiscount {
  discount?: DiscountObject;
  category?: string;
}

interface CategoryWithDiscount {
  discount?: DiscountObject;
}

export const resolveItemDiscount = (
  item: ItemWithDiscount,
  category?: CategoryWithDiscount
): DiscountObject | null => {
  if (item.discount && isDiscountActive(item.discount) && isWithinTimeRules(item.discount.timeRules)) {
    return item.discount;
  }

  if (category?.discount && isDiscountActive(category.discount) && isWithinTimeRules(category.discount.timeRules)) {
    return category.discount;
  }

  return null;
};
