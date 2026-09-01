import type { WalletTransaction } from "@ordersync/types";
import type {
  FirestoreLike,
  FirestoreTransactionLike,
  TransactionInput,
} from "./types";

/**
 * Appends an immutable entry to the wallet_transactions ledger. Every wallet
 * mutation (grant / redeem / expire / clawback / admin adjust) must write a
 * transaction so the ledger is a complete audit trail.
 */
export function writeWalletTransaction(
  db: FirestoreLike,
  transaction: FirestoreTransactionLike,
  input: TransactionInput
): void {
  const ref = db.collection("wallet_transactions").doc();
  const doc: WalletTransaction = {
    id: ref.id as string,
    userId: input.userId,
    creditId: input.creditId,
    type: input.type,
    amount: input.amount,
    balanceAfter: input.balanceAfter,
    createdAt: Date.now(),
  };
  if (input.orderId) doc.orderId = input.orderId;
  if (input.actorId) doc.actorId = input.actorId;
  if (input.reason) doc.reason = input.reason;
  if (input.originalCreditId) doc.originalCreditId = input.originalCreditId;
  if (input.originalExpiresAt) doc.originalExpiresAt = input.originalExpiresAt;
  transaction.set(db.collection("wallet_transactions").doc(ref.id), doc);
}
