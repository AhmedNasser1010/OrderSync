import type { WalletCredit } from "@ordersync/types";
import type { WalletCtx, WalletDataShape } from "./types";
import { round2 } from "./types";
import { writeTx } from "./grantCredit";

export interface ExpireResult {
  expiredAmount: number;
  newBalance: number;
  removedCount: number;
}

/**
 * Marks ACTIVE credits that have passed their expiry as EXPIRED and reduces the
 * customer's balance accordingly. The caller must pass in the customer's expired
 * ACTIVE credits (fetched via a normal query filtered by expiresAt < now).
 */
export async function expireCredits(
  ctx: WalletCtx,
  input: {
    userId: string;
    expiredCredits: WalletCredit[];
  },
  actorId = "system"
): Promise<ExpireResult> {
  const now = Date.now();
  const expired = input.expiredCredits.filter(
    (c) => c.status === "ACTIVE" && (c.expiresAt ?? 0) < now
  );

  let expiredAmount = 0;
  for (const credit of expired) {
    const amount = round2(credit.amount ?? 0);
    expiredAmount = round2(expiredAmount + amount);
    ctx.transaction.update(ctx.creditRef(credit.id), {
      status: "EXPIRED",
    });
  }

  const prevBalance = await getBalance(ctx);
  const newBalance = round2(Math.max(0, prevBalance - expiredAmount));

  ctx.transaction.update(ctx.customerRef, {
    "wallet.balance": newBalance,
    "wallet.updatedAt": now,
  });

  for (const credit of expired) {
    writeTx(ctx, {
      userId: input.userId,
      creditId: credit.id,
      type: "EXPIRE",
      amount: round2(credit.amount ?? 0),
      balanceAfter: newBalance,
      actorId,
    });
  }

  return { expiredAmount, newBalance, removedCount: expired.length };
}

async function getBalance(ctx: WalletCtx): Promise<number> {
  const snap = await ctx.transaction.get(ctx.customerRef);
  const data = (snap.data() ?? {}) as WalletDataShape;
  const nested = data.wallet?.balance;
  return typeof nested === "number" ? nested : data.balance ?? 0;
}
