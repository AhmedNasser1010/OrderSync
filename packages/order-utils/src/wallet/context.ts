import type { FirestoreRefLike, FirestoreTransactionLike, WalletCtx } from "./types";

export interface WalletCtxDeps {
  transaction: FirestoreTransactionLike;
  customerDocRef: (userId: string) => unknown;
  creditsCol: (id?: string) => FirestoreRefLike & unknown;
  transactionsCol: (id?: string) => FirestoreRefLike & unknown;
}
/**
 * Builds a WalletCtx bound to the caller's active transaction and collection
 * ref factories. Call this inside an existing Firestore transaction so all
 * wallet writes participate in the same atomic unit as the caller's own writes.
 */
export function createWalletCtx(
  deps: WalletCtxDeps,
  userId: string
): WalletCtx {
  return {
    transaction: deps.transaction,
    customerRef: deps.customerDocRef(userId),
    creditRef: (id?: string) => deps.creditsCol(id) as FirestoreRefLike & unknown,
    txRef: (id?: string) =>
      deps.transactionsCol(id) as FirestoreRefLike & unknown,
  };
}
