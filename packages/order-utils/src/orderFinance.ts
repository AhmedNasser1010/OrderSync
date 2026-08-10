import type { OrderType } from "@ordersync/types";

export const DEFAULT_COMMISSION_PERCENT = 10;

export interface OrderFinanceInput {
  subtotal: number;
  discount: number;
  deliveryFees: number;
  total: number;
  commissionPercent?: number;
}

export interface OrderFinanceResult {
  commissionPercent: number;
  commissionAmount: number;
  restaurantShare: number;
  companyShare: number;
  cashCollected: number;
  driverEarnings: number;
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * Computes the order finance breakdown shared by the client and the
 * server (which is authoritative). Model:
 *
 *   foodRevenue     = subtotal - discount                  (food after discounts)
 *   commission      = commissionPercent% x foodRevenue     (platform's share)
 *   restaurantShare = foodRevenue - commission             (restaurant net == payment)
 *   driverEarnings  = deliveryFees                         (driver keeps the full fee)
 *   cashCollected   = total                                (collected from the customer)
 */
export function calculateOrderFinance(
  input: OrderFinanceInput
): OrderFinanceResult {
  const commissionPercent =
    input.commissionPercent ?? DEFAULT_COMMISSION_PERCENT;

  const foodRevenue = clamp(input.subtotal - input.discount, 0, Infinity);
  const commissionAmount = round2(
    foodRevenue * (commissionPercent / 100)
  );
  const restaurantShare = round2(foodRevenue - commissionAmount);

  return {
    commissionPercent,
    commissionAmount,
    restaurantShare,
    companyShare: commissionAmount,
    cashCollected: input.total,
    driverEarnings: input.deliveryFees,
  };
}

/**
 * Returns the amount the restaurant keeps from an order (net of delivery fees
 * and platform commission). Prefers the authoritative `finance.restaurantShare`
 * and falls back to `total - deliveryFees - commissionAmount` for legacy orders
 * that predate the finance model.
 */
export function getOrderRestaurantNet(
  order: Pick<OrderType, "pricing" | "finance">
): number {
  if (order.finance?.restaurantShare != null) {
    return order.finance.restaurantShare;
  }
  return round2(
    order.pricing.total -
      (order.pricing.deliveryFees ?? 0) -
      (order.finance?.commissionAmount ?? 0)
  );
}
