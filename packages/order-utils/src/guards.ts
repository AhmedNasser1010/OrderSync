import type { OrderStatusType, OrderType } from "@ordersync/types";
import { ALLOWED_TRANSITIONS, REVERSE_TRANSITIONS } from "./transitions";
import {
  TERMINAL_STATUSES,
  MARKETPLACE_STATUSES,
  DRIVER_OWNED_STATUSES,
  RESTAURANT_ACTIVE_STATUSES,
  CUSTOMER_CANCELLABLE_STATUSES,
  RESTAURANT_CANCELABLE_STATUSES,
  DRIVER_CANCELABLE_STATUSES,
} from "./constants";

export function canTransition(
  current: OrderStatusType,
  next: OrderStatusType,
): boolean {
  return ALLOWED_TRANSITIONS[current]?.includes(next) ?? false;
}

export function isFinalStatus(status: OrderStatusType): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function isMarketplaceVisible(order: OrderType): boolean {
  return MARKETPLACE_STATUSES.includes(order.status.current);
}

export function isDriverOwned(order: OrderType): boolean {
  return DRIVER_OWNED_STATUSES.includes(order.status.current);
}

export function isRestaurantActive(order: OrderType): boolean {
  return RESTAURANT_ACTIVE_STATUSES.includes(order.status.current);
}

export function isCustomerCancelable(order: OrderType): boolean {
  if (!CUSTOMER_CANCELLABLE_STATUSES.includes(order.status.current)) {
    return false;
  }
  return order.assignment.driverUid === null;
}

export function isRestaurantCancelable(order: OrderType): boolean {
  return RESTAURANT_CANCELABLE_STATUSES.includes(order.status.current);
}

export function isDriverCancelable(order: OrderType): boolean {
  if (!DRIVER_CANCELABLE_STATUSES.includes(order.status.current)) {
    return false;
  }
  return true;
}

export function getNextStatuses(
  current: OrderStatusType,
): OrderStatusType[] {
  return ALLOWED_TRANSITIONS[current] ?? [];
}

export function canReverseTransition(
  current: OrderStatusType,
  previous: OrderStatusType,
): boolean {
  return REVERSE_TRANSITIONS[current]?.includes(previous) ?? false;
}

export function getPreviousStatuses(
  current: OrderStatusType,
): OrderStatusType[] {
  return REVERSE_TRANSITIONS[current] ?? [];
}

export function getTimelineField(status: OrderStatusType): string {
  const map: Record<OrderStatusType, string> = {
    RECEIVED: "placedAt",
    ACCEPTED: "acceptedAt",
    PREPARING: "preparingAt",
    READY: "readyAt",
    RESERVED: "reservedAt",
    PICKED_UP: "pickedUpAt",
    ON_ROUTE: "onRouteAt",
    DELIVERED: "deliveredAt",
    GIVEN_FEEDBACK: "feedbackAt",
    CANCELED: "canceledAt",
    REJECTED: "rejectedAt",
    VOIDED: "voidedAt",
  };
  return map[status];
}
