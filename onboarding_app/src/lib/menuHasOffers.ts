import type { DiscountObject, MainMenuType } from "@ordersync/types";

function isDiscountActive(discount: DiscountObject | undefined): boolean {
  if (!discount || !discount.active) return false;

  const now = Date.now();
  if (discount.startAt && now < discount.startAt) return false;
  if (discount.expireAt && now > discount.expireAt) return false;

  return true;
}

export function menuHasOffers(menu: MainMenuType | undefined | null): boolean {
  if (!menu) return false;

  const items = Array.isArray(menu.items) ? menu.items : [];
  const categories = Array.isArray(menu.categories) ? menu.categories : [];
  const orderDiscounts = Array.isArray(menu.orderDiscounts)
    ? menu.orderDiscounts
    : [];

  if (items.some((item) => item.visibility && isDiscountActive(item.discount))) {
    return true;
  }

  if (
    categories.some(
      (category) =>
        category.visibility && isDiscountActive(category.discount),
    )
  ) {
    return true;
  }

  if (orderDiscounts.some(isDiscountActive)) {
    return true;
  }

  return false;
}
