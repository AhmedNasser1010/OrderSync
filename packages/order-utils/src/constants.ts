import type { OrderStatusType } from "@ordersync/types";

export const ORDER_STATUSES: OrderStatusType[] = [
  "RECEIVED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "RESERVED",
  "PICKED_UP",
  "ON_ROUTE",
  "DELIVERED",
  "GIVEN_FEEDBACK",
];

export const TERMINAL_STATUSES: OrderStatusType[] = [
  "DELIVERED",
  "GIVEN_FEEDBACK",
  "CANCELED",
  "REJECTED",
  "VOIDED",
];

export const ALTERNATIVE_ENDINGS: OrderStatusType[] = [
  "CANCELED",
  "REJECTED",
  "VOIDED",
];

export const MARKETPLACE_STATUSES: OrderStatusType[] = ["READY"];

export const DRIVER_OWNED_STATUSES: OrderStatusType[] = [
  "RESERVED",
  "PICKED_UP",
  "ON_ROUTE",
];

export const RESTAURANT_ACTIVE_STATUSES: OrderStatusType[] = [
  "RECEIVED",
  "ACCEPTED",
  "PREPARING",
  "READY",
];

export const CUSTOMER_CANCELLABLE_STATUSES: OrderStatusType[] = ["RECEIVED"];

export const RESTAURANT_CANCELABLE_STATUSES: OrderStatusType[] = [
  "RECEIVED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "RESERVED",
];

export const DRIVER_CANCELABLE_STATUSES: OrderStatusType[] = [
  "RESERVED",
  "PICKED_UP",
  "ON_ROUTE",
];
