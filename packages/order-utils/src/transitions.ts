import type { OrderStatusType } from "@ordersync/types";

export const ALLOWED_TRANSITIONS: Record<OrderStatusType, OrderStatusType[]> = {
  RECEIVED: ["ACCEPTED", "PREPARING", "CANCELED", "REJECTED"],
  ACCEPTED: ["PREPARING", "CANCELED", "REJECTED"],
  PREPARING: ["READY", "CANCELED", "REJECTED"],
  READY: ["RESERVED", "CANCELED", "REJECTED", "VOIDED"],
  RESERVED: ["PICKED_UP", "CANCELED", "VOIDED"],
  PICKED_UP: ["ON_ROUTE", "CANCELED", "VOIDED"],
  ON_ROUTE: ["DELIVERED", "CANCELED", "VOIDED"],
  DELIVERED: ["GIVEN_FEEDBACK"],
  GIVEN_FEEDBACK: [],
  CANCELED: [],
  REJECTED: [],
  VOIDED: [],
};

export const REVERSE_TRANSITIONS: Record<OrderStatusType, OrderStatusType[]> = {
  RECEIVED: [],
  ACCEPTED: ["RECEIVED"],
  PREPARING: ["ACCEPTED"],
  READY: ["PREPARING"],
  RESERVED: ["READY"],
  PICKED_UP: ["RESERVED"],
  ON_ROUTE: ["PICKED_UP"],
  DELIVERED: [],
  GIVEN_FEEDBACK: [],
  CANCELED: [],
  REJECTED: [],
  VOIDED: [],
};

export const TIMELINE_FIELD_MAP: Record<OrderStatusType, string> = {
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
