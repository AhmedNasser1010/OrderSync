import type {
  DiscountConditions,
  DiscountCondition,
} from "./types";
import type { User, UserRestaurantHistory } from "./types";

const firstBuy = (
  _user: User,
  _value: number,
  currentRes: UserRestaurantHistory | undefined
): boolean => currentRes === undefined;

const totalSpent = (
  _user: User,
  value: number,
  currentRes: UserRestaurantHistory | undefined
): boolean => (currentRes?.totalAmount ?? 0) >= value;

const totalItems = (
  _user: User,
  value: number,
  currentRes: UserRestaurantHistory | undefined
): boolean => (currentRes?.totalItems ?? 0) >= value;

const totalOrders = (
  _user: User,
  value: number,
  currentRes: UserRestaurantHistory | undefined
): boolean => (currentRes?.totalOrders ?? 0) >= value;

const joinDate = (user: User, value: number): boolean => {
  if (!user.createdAt) return false;
  const daysSinceJoin = (Date.now() - user.createdAt) / (1000 * 60 * 60 * 24);
  return daysSinceJoin >= value;
};

const lastOrder = (
  _user: User,
  value: number,
  currentRes: UserRestaurantHistory | undefined
): boolean => {
  if (!currentRes?.lastOrderAt) return false;
  const daysSinceLastOrder =
    (Date.now() - currentRes.lastOrderAt) / (1000 * 60 * 60 * 24);
  return daysSinceLastOrder >= value;
};

const evaluateSingleCondition = (
  condition: DiscountCondition,
  user: User,
  resId: string
): boolean => {
  const currentRes = user.restaurants?.find((r) => r.accessToken === resId);

  switch (condition.type) {
    case "FIRSTBUY":
      return firstBuy(user, condition.value, currentRes);
    case "TOTALSPENT":
      return totalSpent(user, condition.value, currentRes);
    case "TOTALITEMS":
      return totalItems(user, condition.value, currentRes);
    case "TOTALORDERS":
      return totalOrders(user, condition.value, currentRes);
    case "JOINDATE":
      return joinDate(user, condition.value);
    case "LASTORDER":
      return lastOrder(user, condition.value, currentRes);
    case "CUSTOMERLTV":
      return (user.restaurants?.length ?? 0) >= condition.value;
    default:
      return false;
  }
};

export const evaluateConditions = (
  conditions: DiscountConditions,
  user: User,
  resId: string
): boolean => {
  if (!conditions || !conditions.rules || conditions.rules.length === 0) {
    return true;
  }

  if (conditions.operator === "AND") {
    return conditions.rules.every((rule) =>
      evaluateSingleCondition(rule, user, resId)
    );
  }

  return conditions.rules.some((rule) =>
    evaluateSingleCondition(rule, user, resId)
  );
};
