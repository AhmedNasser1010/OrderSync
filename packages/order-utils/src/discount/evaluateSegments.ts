import type { CustomerSegment, DiscountObject } from "./types";
import type { User, UserRestaurantHistory } from "./types";

const DAYS_MS = 1000 * 60 * 60 * 24;

const isNew = (user: User): boolean => {
  if (!user.createdAt) return false;
  const daysSinceJoin = (Date.now() - user.createdAt) / DAYS_MS;
  return daysSinceJoin <= 30;
};

const isActive = (currentRes: UserRestaurantHistory | undefined): boolean => {
  if (!currentRes?.lastOrderTime) return false;
  const daysSinceLastOrder = (Date.now() - currentRes.lastOrderTime) / DAYS_MS;
  return daysSinceLastOrder <= 14;
};

const isInactive = (currentRes: UserRestaurantHistory | undefined): boolean => {
  if (!currentRes?.lastOrderTime) return true;
  const daysSinceLastOrder = (Date.now() - currentRes.lastOrderTime) / DAYS_MS;
  return daysSinceLastOrder > 30;
};

const isVip = (currentRes: UserRestaurantHistory | undefined): boolean => {
  if (!currentRes) return false;
  return (currentRes.totalAmount ?? 0) > 1000 || (currentRes.totalOrders ?? 0) > 50;
};

const isAtRisk = (currentRes: UserRestaurantHistory | undefined): boolean => {
  if (!currentRes?.lastOrderTime) return false;
  const daysSinceLastOrder = (Date.now() - currentRes.lastOrderTime) / DAYS_MS;
  return daysSinceLastOrder > 21 && daysSinceLastOrder <= 60;
};

const segmentEvaluators: Record<
  Exclude<CustomerSegment, "custom">,
  (user: User, currentRes: UserRestaurantHistory | undefined) => boolean
> = {
  new: isNew,
  active: (user, res) => isActive(res),
  inactive: (_user, res) => isInactive(res),
  vip: (_user, res) => isVip(res),
  at_risk: (_user, res) => isAtRisk(res),
};

export const evaluateSegment = (
  segment: CustomerSegment,
  user: User,
  resId: string
): boolean => {
  if (segment === "custom") return false;

  const currentRes = user.restaurants?.find((r) => r.accessToken === resId);
  return segmentEvaluators[segment](user, currentRes);
};

export const evaluateSegments = (
  segments: CustomerSegment[],
  user: User,
  resId: string
): boolean => {
  if (!segments || segments.length === 0) return true;
  return segments.some((segment) => evaluateSegment(segment, user, resId));
};

export const getUserSegments = (
  user: User,
  resId: string
): CustomerSegment[] => {
  const allSegments: Exclude<CustomerSegment, "custom">[] = [
    "new",
    "active",
    "inactive",
    "vip",
    "at_risk",
  ];
  return allSegments.filter((seg) => evaluateSegment(seg, user, resId));
};
