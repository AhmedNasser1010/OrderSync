import type { CategoryType, ItemType, DiscountObject } from "@ordersync/types";

export interface MenuCategory extends CategoryType {
  items: ItemType[];
}

export interface MenuData {
  categories: MenuCategory[];
  orderDiscounts?: DiscountObject[];
  lastSynced: string;
}
