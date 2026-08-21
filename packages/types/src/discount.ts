export type DiscountLevel = "item" | "order" | "category";
export type DiscountType = "P" | "FIXED";
export type ConditionOperator = "AND" | "OR";

export type ConditionType =
  | "FIRSTBUY"
  | "TOTALSPENT"
  | "TOTALITEMS"
  | "TOTALORDERS"
  | "JOINDATE"
  | "LASTORDER"
  | "CUSTOMERLTV";

export type StackingMode =
  | "highest"
  | "lowest"
  | "stack"
  | "priority"
  | "exclusive";

export type CustomerSegment =
  | "new"
  | "active"
  | "inactive"
  | "vip"
  | "at_risk"
  | "custom";

export interface DiscountCondition {
  type: ConditionType;
  value: number;
}

export interface DiscountConditions {
  operator: ConditionOperator;
  rules: DiscountCondition[];
}

export interface TimeRules {
  enabled: boolean;
  days: number[];
  startTime: string;
  endTime: string;
}

export interface DiscountObject {
  id: string;
  code: string;
  message: string;
  level: DiscountLevel;
  type: DiscountType;
  value: number;
  maxDiscountValue?: number;
  itemId?: string;
  categoryId?: string;
  minOrderTotal?: number;
  minCartItems?: number;
  conditions: DiscountConditions;
  stackingMode?: StackingMode;
  priority?: number;
  startAt?: number | null;
  expireAt?: number | null;
  usageLimit?: number | null;
  usageCount?: number;
  perUserLimit?: number;
  timeRules?: TimeRules | null;
  segments?: CustomerSegment[];
  active: boolean;
}

export interface PromoCode {
  id: string;
  restaurantId: string;
  code: string;
  type: DiscountType;
  value: number;
  maxDiscountValue?: number;
  message: string;
  level: DiscountLevel;
  minOrderTotal?: number;
  minCartItems?: number;
  conditions: DiscountConditions;
  startAt?: number | null;
  expireAt?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  perUserLimit?: number;
  active: boolean;
}

export interface DiscountRedemption {
  id: string;
  discountId: string;
  userId: string;
  orderId: string;
  restaurantId: string;
  amount: number;
  createdAt: number;
}

export type PromoCodeValidationResult =
  | { valid: true; promoCode: PromoCode }
  | { valid: false; error: string };
