import type { ItemType } from "@ordersync/types";
import type { RestaurantDocument } from "@/types/restaurant";
import workingDaysChecker from "@/utils/workingDaysChecker";

export type ReorderLine = {
  id: string;
  quantity: number;
  selectedSize?: string | null;
};

export type ReorderableOrder = {
  businessId: string;
  cart: ReorderLine[];
};

export type ReorderInvalidReason =
  | "restaurant-unavailable"
  | "restaurant-closed"
  | "items-changed";

export type ReorderValidation =
  | { ok: true }
  | { ok: false; reason: ReorderInvalidReason };

export const validateReorder = (
  order: ReorderableOrder,
  restaurants: RestaurantDocument[],
  menuItems: ItemType[]
): ReorderValidation => {
  const restaurant = restaurants.find(
    (candidate) => candidate.accessToken === order.businessId
  );

  if (!restaurant) {
    return { ok: false, reason: "restaurant-unavailable" };
  }

  const isOpen =
    restaurant.status !== "inactive" &&
    restaurant.status !== "pause" &&
    restaurant.status !== "hidden" &&
    workingDaysChecker(
      restaurant.operations?.openingHours,
      undefined,
      restaurant.operations?.openNowUntil
    ) !== false;

  if (!isOpen) {
    return { ok: false, reason: "restaurant-closed" };
  }

  for (const line of order.cart ?? []) {
    const menuItem = menuItems.find((item) => item.id === line.id);

    if (!menuItem || menuItem.visibility === false) {
      return { ok: false, reason: "items-changed" };
    }

    if (line.selectedSize) {
      const sizeStillExists = menuItem.sizes?.some(
        (size) => size.size === line.selectedSize
      );
      if (!sizeStillExists) {
        return { ok: false, reason: "items-changed" };
      }
    } else if (menuItem.sizes?.length) {
      return { ok: false, reason: "items-changed" };
    }
  }

  return { ok: true };
};
