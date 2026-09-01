export type WalletCreditSource =
  | "CAMPAIGN"
  | "ADMIN_ADJUST"
  | "ORDER_EARN"
  | "WELCOME"
  | "WINBACK";

export type WalletCreditStatus =
  | "ACTIVE"
  | "REDEEMED"
  | "EXPIRED"
  | "CLAWED_BACK";

export interface WalletCredit {
  id: string;
  userId: string;
  amount: number;
  expiresAt: number;
  source: WalletCreditSource;
  status: WalletCreditStatus;
  orderId?: string;
  campaignId?: string;
  createdBy?: string;
  reason?: string;
  createdAt: number;
}

export type WalletTransactionType =
  | "GRANT"
  | "REDEEM"
  | "EXPIRE"
  | "CLAWBACK"
  | "ADMIN_ADJUST";

export interface WalletTransaction {
  id: string;
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
  createdAt: number;
}

export interface CashbackConfig {
  enabled: boolean;
  cashbackPercent: number;
  wipeDays: number;
  redemptionThreshold: number;
  maxCashbackPerTx: number;
}
