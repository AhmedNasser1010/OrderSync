import type { ItemType } from "@ordersync/types";
import type { OrderStatusType } from "@ordersync/types";

export type MainTabTypes = "RECEIVED" | "PREPARING" | "DELIVERY" | "COMPLETED" | "VOIDED";

export type CartItemType = {
  id: string;
  quantity: number;
  selectedSize: string;
  discountCode?: string;
};

export type FormattedOrderType = {
  id: string;
  orderNumber: number;
  customer: string;
  total: string;
  status: OrderStatusType;
  items: string;
  placedAt: number;
};
