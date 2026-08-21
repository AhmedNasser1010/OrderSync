import type { DiscountObject, StackingMode } from "./types";
import { calculateDiscountAmount } from "./discountAmount";

const calculateSavings = (
  discount: DiscountObject,
  cartTotal: number
): number => {
  return calculateDiscountAmount(cartTotal, discount);
};

const sortByPriority = (discounts: DiscountObject[]): DiscountObject[] => {
  return [...discounts].sort(
    (a, b) => (a.priority ?? 0) - (b.priority ?? 0)
  );
};

const sortBySavingsDesc = (
  discounts: DiscountObject[],
  cartTotal: number
): DiscountObject[] => {
  return [...discounts].sort(
    (a, b) => calculateSavings(b, cartTotal) - calculateSavings(a, cartTotal)
  );
};

const sortBySavingsAsc = (
  discounts: DiscountObject[],
  cartTotal: number
): DiscountObject[] => {
  return [...discounts].sort(
    (a, b) => calculateSavings(a, cartTotal) - calculateSavings(b, cartTotal)
  );
};

export const applyStackingRules = (
  eligibleDiscounts: DiscountObject[],
  cartTotal: number
): DiscountObject[] => {
  if (eligibleDiscounts.length === 0) return [];
  if (eligibleDiscounts.length === 1) return eligibleDiscounts;

  const exclusiveDiscounts = eligibleDiscounts.filter(
    (d) => d.stackingMode === "exclusive"
  );
  if (exclusiveDiscounts.length > 0) {
    const highestPriority = sortByPriority(exclusiveDiscounts)[0];
    return [highestPriority];
  }

  const primaryMode = eligibleDiscounts[0]?.stackingMode ?? "highest";

  switch (primaryMode) {
    case "priority": {
      const sorted = sortByPriority(eligibleDiscounts);
      return [sorted[0]];
    }

    case "highest": {
      const sorted = sortBySavingsDesc(eligibleDiscounts, cartTotal);
      return [sorted[0]];
    }

    case "lowest": {
      const sorted = sortBySavingsAsc(eligibleDiscounts, cartTotal);
      return [sorted[0]];
    }

    case "stack": {
      return sortByPriority(eligibleDiscounts);
    }

    default:
      return [eligibleDiscounts[0]];
  }
};

export const applyStackedDiscounts = (
  price: number,
  discounts: DiscountObject[]
): number => {
  return discounts.reduce(
    (currentPrice, discount) =>
      currentPrice - calculateDiscountAmount(currentPrice, discount),
    price
  );
};
