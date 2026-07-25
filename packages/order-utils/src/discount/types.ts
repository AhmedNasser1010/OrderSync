export type {
  DiscountLevel,
  DiscountType,
  ConditionOperator,
  ConditionType,
  StackingMode,
  CustomerSegment,
  DiscountCondition,
  DiscountConditions,
  TimeRules,
  DiscountObject,
  PromoCode,
  DiscountRedemption,
  PromoCodeValidationResult,
} from "@ordersync/types";

export interface UserRestaurantHistory {
  accessToken: string;
  totalAmount?: number;
  totalItems?: number;
  totalOrders?: number;
  lastOrderTime?: number;
}

export interface User {
  createdAt?: number;
  restaurants?: UserRestaurantHistory[];
}

export interface PriceAfterDiscountResult {
  finalPrice: number;
  isAvailableForUser: boolean;
}
