import type { WalletCredit } from "@ordersync/types";
import type { WalletCtx, WalletDataShape } from "./types";
import { round2 } from "./types";
import { writeTx } from "./grantCredit";

export interface RedeemResult {
  redeemedAmount: number;
  creditsUsed: { credit: WalletCredit; usedAmount: number }[];
  newBalance: number;
}

/**
 * Redeems active credits to cover up to `amount` using FIFO (soonest-expiring
 * first). Consumes whole credits; the final credit may be partially consumed by
 * reducing its remaining `amount` while keeping it ACTIVE. The caller must pass
 * in the customer's active, unexpired credits fetched via a normal query, since
 * transaction.get() only supports document refs, not queries.
 */
export async function redeemCredits(
  ctx: WalletCtx,
  input: {
    userId: string;
    amount: number;
    orderId?: string;
    activeCredits: WalletCredit[];
  },
  actorId = "system"
): Promise<RedeemResult> {
  const now = Date.now();
  const sorted = [...input.activeCredits]
    .filter((c) => c.status === "ACTIVE" && (c.expiresAt ?? 0) >= now)
    .sort((a, b) => a.expiresAt - b.expiresAt);

  let remaining = round2(input.amount);
  const creditsUsed: RedeemResult["creditsUsed"] = [];

  for (const credit of sorted) {
    if (remaining <= 0) break;
    const snap = await ctx.transaction.get(ctx.creditRef(credit.id));
    const current = (snap.data() ?? {}) as WalletCredit;
    if (current.status !== "ACTIVE" || (current.expiresAt ?? 0) < now) continue;

    const creditAmount = round2(current.amount ?? 0);
    if (creditAmount <= 0) continue;

    const use = round2(Math.min(creditAmount, remaining));
    const fullyConsumed = use >= creditAmount;

    if (fullyConsumed) {
      ctx.transaction.update(ctx.creditRef(credit.id), {
        status: "REDEEMED",
      });
    } else {
      // Partial consumption: reduce the credit's remaining amount, keep ACTIVE.
      ctx.transaction.update(ctx.creditRef(credit.id), {
        amount: round2(creditAmount - use),
      });
    }

    creditsUsed.push({ credit: current, usedAmount: use });
    remaining = round2(remaining - use);
  }

  const usedTotal = round2(
    creditsUsed.reduce((sum, c) => sum + c.usedAmount, 0)
  );

  const prevBalance = await getBalance(ctx);
  const newBalance = round2(Math.max(0, prevBalance - usedTotal));

  ctx.transaction.update(ctx.customerRef, {
    "wallet.balance": newBalance,
    "wallet.updatedAt": now,
  });

  for (const c of creditsUsed) {
    writeTx(ctx, {
      userId: input.userId,
      creditId: c.credit.id,
      type: "REDEEM",
      amount: c.usedAmount,
      balanceAfter: newBalance,
      orderId: input.orderId,
      actorId,
    });
  }

  return { redeemedAmount: usedTotal, creditsUsed, newBalance };
}

async function getBalance(ctx: WalletCtx): Promise<number> {
  const snap = await ctx.transaction.get(ctx.customerRef);
  const data = (snap.data() ?? {}) as WalletDataShape;
  const nested = data.wallet?.balance;
  return typeof nested === "number" ? nested : data.balance ?? 0;
}
