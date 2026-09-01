import type { WalletCredit } from "@ordersync/types";
import type { CreditInput, WalletCtx, WalletDataShape } from "./types";
import { round2 } from "./types";

export interface GrantResult {
  creditId: string;
  credit: WalletCredit;
  newBalance: number;
}

/**
 * Records an immutable ledger transaction. Must be called inside an active
 * transaction (via WalletCtx).
 */
function writeTx(
  ctx: WalletCtx,
  tx: {
    userId: string;
    creditId: string;
    type: "GRANT" | "REDEEM" | "EXPIRE" | "CLAWBACK" | "ADMIN_ADJUST";
    amount: number;
    balanceAfter: number;
    orderId?: string;
    actorId: string;
    reason?: string;
    originalCreditId?: string;
    originalExpiresAt?: number;
  }
): void {
  const ref = ctx.txRef();
  const doc = {
    id: ref.id,
    userId: tx.userId,
    creditId: tx.creditId,
    type: tx.type,
    amount: tx.amount,
    balanceAfter: tx.balanceAfter,
    actorId: tx.actorId,
    createdAt: Date.now(),
  } as Record<string, unknown>;
  if (tx.orderId) doc.orderId = tx.orderId;
  if (tx.reason) doc.reason = tx.reason;
  if (tx.originalCreditId) doc.originalCreditId = tx.originalCreditId;
  if (tx.originalExpiresAt) doc.originalExpiresAt = tx.originalExpiresAt;
  ctx.transaction.set(ref, doc);
}

/**
 * Reads the customer's current wallet balance via the active transaction.
 * All reads MUST complete before any writes within the transaction.
 */
export async function getCustomerBalance(ctx: WalletCtx): Promise<number> {
  const snap = await ctx.transaction.get(ctx.customerRef);
  const data = (snap.data() ?? {}) as WalletDataShape;
  const nested = data.wallet?.balance;
  return typeof nested === "number" ? nested : data.balance ?? 0;
}

/**
 * Grants a credit and records the ledger transaction. Must be called inside an
 * active transaction. Reads the current balance, then writes the credit, the
 * ledger entry, and the updated customer wallet balance.
 */
export async function grantCredit(
  ctx: WalletCtx,
  input: CreditInput
): Promise<GrantResult> {
  const now = Date.now();
  const creditRef = ctx.creditRef();
  const creditId = creditRef.id;

  const credit: WalletCredit = {
    id: creditId,
    userId: input.userId,
    amount: round2(input.amount),
    expiresAt: input.expiresAt,
    source: input.source,
    status: input.status ?? "ACTIVE",
    createdAt: now,
  };
  if (input.orderId) credit.orderId = input.orderId;
  if (input.campaignId) credit.campaignId = input.campaignId;
  if (input.createdBy) credit.createdBy = input.createdBy;
  if (input.reason) credit.reason = input.reason;

  const prevBalance = await getCustomerBalance(ctx);
  const newBalance = round2(prevBalance + credit.amount);

  ctx.transaction.set(creditRef, credit);
  ctx.transaction.update(ctx.customerRef, {
    "wallet.balance": newBalance,
    "wallet.updatedAt": now,
  });
  writeTx(ctx, {
    userId: input.userId,
    creditId,
    type: "GRANT",
    amount: credit.amount,
    balanceAfter: newBalance,
    orderId: input.orderId,
    actorId: input.createdBy ?? "system",
    reason: input.reason,
  });

  return { creditId, credit, newBalance };
}

export { writeTx };
