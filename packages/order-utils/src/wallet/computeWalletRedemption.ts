import { round2 } from "./types";

export interface WalletRedemptionComputeInput {
  /** Amount the customer asked to apply (their wallet balance or a subset). */
  requested: number;
  /** Current wallet balance — redemption can never exceed it. */
  balance: number;
  /** Order total BEFORE wallet redemption, including delivery fees. */
  orderTotal: number;
  /** Whether the platform has cashback redemption enabled. */
  enabled: boolean;
  /** If the order is below this minimum, cashback cannot be used at all. */
  redemptionThreshold: number;
  /** Per-transaction cap. 0 means no cap. */
  maxCashbackPerTx: number;
  /** Cashback cannot stack with a discount/promo on the order. */
  hasDiscount: boolean;
}

/**
 * Computes how much cashback credit may be applied to an order. Shared by the
 * customer cart (for display and the checkout payload) and by the
 * placeOrderServer redemption path so both sides agree on the exact amount.
 * Never returns more than the requested amount, the balance, the per-transaction
 * cap, or the order total.
 */
export function computeWalletRedemption(
  input: WalletRedemptionComputeInput
): number {
  if (!input.enabled) return 0;
  if (input.hasDiscount) return 0;
  if (
    input.redemptionThreshold > 0 &&
    input.orderTotal < input.redemptionThreshold
  ) {
    return 0;
  }

  const requested = round2(Math.max(0, Math.min(input.requested, input.balance)));
  const capped =
    input.maxCashbackPerTx > 0
      ? Math.min(requested, input.maxCashbackPerTx)
      : requested;

  return round2(Math.max(0, Math.min(capped, input.orderTotal)));
}