"use server";

import { initAdmin } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import {
  createWalletCtx,
  grantCredit,
  getCustomerBalance,
  DAY_MS,
} from "@ordersync/order-utils";
import type { WalletCredit } from "@ordersync/types";

export type AdjustCreditResult =
  | { success: true; newBalance: number }
  | { success: false; code: string };

const DEFAULT_ADMIN_CREDIT_DAYS = 90;

/**
 * Manually adjusts a customer's cash-back wallet for an ADMIN. A non-empty
 * reason is mandatory for the audit trail. Grants a positive amount as a new
 * credit (with the configured/default expiry); a negative amount claws back
 * from the oldest active credits first.
 */
export async function adjustCredit(args: {
  targetUserId: string;
  amount: number;
  reason: string;
  idToken: string;
  days?: number;
}): Promise<AdjustCreditResult> {
  try {
    const { targetUserId, amount, reason, idToken, days } = args;

    if (!targetUserId) return { success: false, code: "NO_TARGET" };
    if (!reason || reason.trim().length === 0) {
      return { success: false, code: "REASON_REQUIRED" };
    }
    if (!Number.isFinite(amount) || amount === 0) {
      return { success: false, code: "INVALID_AMOUNT" };
    }

    const app = await initAdmin();
    const db = getFirestore(app);
    const auth = getAuth(app);

    // Verify the caller from their ID token (never trust client-supplied uids).
    let adminUid: string;
    try {
      const decoded = await auth.verifyIdToken(idToken);
      const isAdmin =
        decoded.role === "BUSINESSES_CREATOR" ||
        decoded.role === "BUSINESS_MANAGER";
      if (!isAdmin) return { success: false, code: "FORBIDDEN" };
      adminUid = decoded.uid;
    } catch {
      return { success: false, code: "FORBIDDEN" };
    }

    const customerRef = db.collection("customers").doc(targetUserId);
    const customerSnap = await customerRef.get();
    if (!customerSnap.exists) return { success: false, code: "TARGET_NOT_FOUND" };

    return await db.runTransaction(async (transaction) => {
      const ctx = createWalletCtx(
        {
          transaction,
          customerDocRef: () => customerRef,
          creditsCol: (id?: string) =>
            id
              ? db.collection("wallet_credits").doc(id)
              : db.collection("wallet_credits").doc(),
          transactionsCol: (id?: string) =>
            id
              ? db.collection("wallet_transactions").doc(id)
              : db.collection("wallet_transactions").doc(),
        },
        targetUserId
      );

      if (amount > 0) {
        const expiresAt =
          Date.now() + (days && days > 0 ? days : DEFAULT_ADMIN_CREDIT_DAYS) * DAY_MS;
        const result = await grantCredit(ctx, {
          userId: targetUserId,
          amount,
          expiresAt,
          source: "ADMIN_ADJUST",
          createdBy: adminUid,
          reason: reason.trim(),
        });
        return { success: true, newBalance: result.newBalance };
      }

      // Negative amount: revoke from oldest active credits first.
      const revoke = Math.abs(amount);
      const balance = await getCustomerBalance(ctx);
      const toRevoke = Math.min(revoke, balance);

      const active = await db
        .collection("wallet_credits")
        .where("userId", "==", targetUserId)
        .where("status", "==", "ACTIVE")
        .get();

      let remaining = toRevoke;
      const activeCredits = active.docs
        .map((d) => ({ ...(d.data() as WalletCredit), id: d.id }))
        .sort((a, b) => a.expiresAt - b.expiresAt);

      for (const credit of activeCredits) {
        if (remaining <= 0) break;
        const creditAmount = credit.amount ?? 0;
        if (creditAmount <= 0) continue;
        const take = Math.min(creditAmount, remaining);
        transaction.update(db.collection("wallet_credits").doc(credit.id), {
          amount: Math.max(0, creditAmount - take),
          status: creditAmount - take <= 0 ? "CLAWED_BACK" : "ACTIVE",
        });
        remaining = remaining - take;
      }

      const newBalance = Math.max(0, balance - toRevoke);
      transaction.update(customerRef, {
        "wallet.balance": newBalance,
        "wallet.updatedAt": Date.now(),
      });

      const txRef = db.collection("wallet_transactions").doc();
      transaction.set(txRef, {
        id: txRef.id,
        userId: targetUserId,
        creditId: "ADMIN_REVOKE",
        type: "ADMIN_ADJUST",
        amount: -toRevoke,
        balanceAfter: newBalance,
        actorId: adminUid,
        reason: reason.trim(),
        createdAt: Date.now(),
      });

      return { success: true, newBalance };
    });
  } catch (error) {
    console.error("Server Action [adjustCredit]:", error);
    return { success: false, code: "INTERNAL_ERROR" };
  }
}
