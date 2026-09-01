import type {
  WalletCredit,
  WalletCreditSource,
  WalletCreditStatus,
  WalletTransaction,
  WalletTransactionType,
} from "@ordersync/types";

/**
 * A single REDEEM ledger row used to reconstruct exactly how much of each
 * credit an order spent at checkout. Needed to restore partially-consumed
 * credits (which keep status ACTIVE with a reduced amount) on cancellation.
 */
export interface RedeemLedgerEntry {
  creditId: string;
  amount: number;
}

export interface CreditInput {
  userId: string;
  amount: number;
  expiresAt: number;
  source: WalletCreditSource;
  orderId?: string;
  campaignId?: string;
  createdBy?: string;
  reason?: string;
  status?: WalletCreditStatus;
}

export interface TransactionInput {
  userId: string;
  creditId: string;
  type: WalletTransactionType;
  amount: number;
  balanceAfter: number;
  orderId?: string;
  actorId: string;
  reason?: string;
  originalCreditId?: string;
  originalExpiresAt?: number;
}

export interface WalletDataShape {
  /** Top-level balance (legacy). Prefer `wallet.balance`. */
  balance?: number;
  wallet?: { balance?: number; updatedAt?: number };
}

/**
 * Minimal structural contracts for the Firestore objects this module needs,
 * so the package has no hard dependency on firebase-admin. The admin SDK's
 * Firestore/Transaction/DocumentReference/DocumentSnapshot satisfy these.
 */
export interface FirestoreDocument {
  data(): unknown;
  exists: boolean;
}

export interface FirestoreTransactionLike {
  get(doc: unknown): Promise<FirestoreDocument>;
  set(doc: unknown, data: unknown): void;
  update(doc: unknown, data: unknown): void;
}

export interface FirestoreRefLike {
  id: string;
  path?: string;
}

/**
 * A context bundling the active transaction with the document ref factories
 * this module needs. Created via `createWalletCtx`.
 */
export interface WalletCtx {
  transaction: FirestoreTransactionLike;
  customerRef: unknown;
  creditRef(id?: string): FirestoreRefLike;
  txRef(id?: string): FirestoreRefLike;
}

export const round2 = (value: number): number => Math.round(value * 100) / 100;

export const DAY_MS = 86_400_000;

export const DEFAULT_WIPE_DAYS = 90;

export type { WalletCredit, WalletTransaction, WalletTransactionType };
