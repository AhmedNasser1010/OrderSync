import type { WalletCredit } from "@ordersync/types";
import type { RedeemLedgerEntry, WalletCtx, WalletDataShape } from "./types";
import { round2 } from "./types";
import { writeTx } from "./grantCredit";

export interface ClawbackResult {
  clawbackAmount: number;
  restoredAmount: number;
  netDelta: number;
  newBalance: number;
}

/**
 * Reverses an order's cash back on cancellation/return:
 *  - Claw back the cashback credit earned from the order (source ORDER_EARN),
 *    setting it to CLAWED_BACK so it can no longer be redeemed.
 *  - Restore any credits the order redeemed back to the customer's wallet with
 *    their original expiration dates (new credit docs referencing the originals).
 *  - Restore partially-consumed credits (still ACTIVE, amount reduced at
 *    checkout) by adding the spent portion back onto the existing credit.
 *
 * The caller must pass in the earned credit doc, the redeemed credits, and the
 * REDEEM ledger rows (all fetched via normal queries), since transaction.get()
 * only supports doc refs. The ledger is required because a partially-consumed
 * credit only stores its reduced amount, not how much the order spent.
 */
export async function clawbackOnCancellation(
  ctx: WalletCtx,
  input: {
    userId: string;
    orderId: string;
    earnedCredit?: WalletCredit | null;
    redeemedCredits: WalletCredit[];
    redeemedLedger?: RedeemLedgerEntry[];
  },
  actorId = "system"
): Promise<ClawbackResult> {
  const now = Date.now();
  let clawbackAmount = 0;
  let restoredAmount = 0;

  // Exact amount each credit spent on this order at checkout.
  const ledgerByCredit = new Map<string, number>();
  for (const entry of input.redeemedLedger ?? []) {
    ledgerByCredit.set(entry.creditId, round2(entry.amount ?? 0));
  }

  // Firestore transactions require all reads to complete before any writes.
  const prevBalance = await getBalance(ctx);

  // 1) Claw back earned cashback (reduces balance).
  if (input.earnedCredit && input.earnedCredit.status === "ACTIVE") {
    const amount = round2(input.earnedCredit.amount);
    ctx.transaction.update(ctx.creditRef(input.earnedCredit.id), {
      status: "CLAWED_BACK",
    });
    clawbackAmount = round2(clawbackAmount + amount);
  }

  // 2) Restore redeemed credits with original expiry dates (increases balance).
  for (const credit of input.redeemedCredits) {
    if (!credit) continue;
    const usedAmount = ledgerByCredit.get(credit.id);
    if (usedAmount === undefined || usedAmount <= 0) continue;

    if (credit.status === "REDEEMED") {
      // Fully consumed: recreate as a new ACTIVE credit with the original expiry.
      const newCreditRef = ctx.creditRef();
      ctx.transaction.set(newCreditRef, {
        id: newCreditRef.id,
        userId: credit.userId,
        amount: usedAmount,
        expiresAt: credit.expiresAt,
        source: credit.source,
        status: "ACTIVE",
        orderId: credit.orderId,
        createdAt: now,
      });
      restoredAmount = round2(restoredAmount + usedAmount);
    } else if (credit.status === "ACTIVE") {
      // Partially consumed: add the spent portion back onto the existing credit.
      ctx.transaction.update(ctx.creditRef(credit.id), {
        amount: round2((credit.amount ?? 0) + usedAmount),
      });
      restoredAmount = round2(restoredAmount + usedAmount);
    }
  }

  const netDelta = round2(restoredAmount - clawbackAmount);

  const newBalance = round2(Math.max(0, prevBalance + netDelta));

  ctx.transaction.update(ctx.customerRef, {
    "wallet.balance": newBalance,
    "wallet.updatedAt": now,
  });

  if (input.earnedCredit && input.earnedCredit.status === "ACTIVE") {
    writeTx(ctx, {
      userId: input.userId,
      creditId: input.earnedCredit.id,
      type: "CLAWBACK",
      amount: round2(input.earnedCredit.amount),
      balanceAfter: newBalance,
      orderId: input.orderId,
      actorId,
    });
  }
  for (const credit of input.redeemedCredits) {
    if (!credit) continue;
    const usedAmount = ledgerByCredit.get(credit.id);
    if (usedAmount === undefined || usedAmount <= 0) continue;
    writeTx(ctx, {
      userId: input.userId,
      creditId: credit.id,
      type: "CLAWBACK",
      amount: -usedAmount,
      balanceAfter: newBalance,
      orderId: input.orderId,
      actorId,
      originalCreditId: credit.id,
      originalExpiresAt: credit.expiresAt,
    });
  }

  return { clawbackAmount, restoredAmount, netDelta, newBalance };
}

async function getBalance(ctx: WalletCtx): Promise<number> {
  const snap = await ctx.transaction.get(ctx.customerRef);
  const data = (snap.data() ?? {}) as WalletDataShape;
  const nested = data.wallet?.balance;
  return typeof nested === "number" ? nested : data.balance ?? 0;
}
