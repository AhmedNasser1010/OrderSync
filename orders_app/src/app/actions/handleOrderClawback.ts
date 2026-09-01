"use server";

import { initAdmin } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import {
  createWalletCtx,
  clawbackOnCancellation,
} from "@ordersync/order-utils";
import type {
  OrderType,
  WalletCredit,
  WalletTransaction,
} from "@ordersync/types";

export type ClawbackResult =
  | { success: true; clawbackAmount: number; restoredAmount: number }
  | { success: false; code: string };

/**
 * Reverses cash back on an order cancellation/return initiated by the
 * restaurant. Claws back the cashback credit earned from the order and restores
 * any credits the order redeemed. Idempotent.
 */
export async function handleOrderClawback(
  orderId: string
): Promise<ClawbackResult> {
  try {
    if (!orderId) return { success: false, code: "INVALID_ORDER" };

    const app = await initAdmin();
    const db = getFirestore(app);

    const orderRef = db.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return { success: false, code: "ORDER_NOT_FOUND" };
    const order = orderSnap.data() as OrderType;

    const isCancelled =
      order.status?.current === "CANCELED" ||
      order.status?.current === "VOIDED" ||
      order.status?.current === "REJECTED";
    if (!isCancelled) return { success: false, code: "NOT_CANCELLED" };

    const uid = order.customerUid ?? order.customer?.uid;
    if (!uid) return { success: false, code: "NO_CUSTOMER" };

    const earned = await db
      .collection("wallet_credits")
      .where("orderId", "==", orderId)
      .where("source", "==", "ORDER_EARN")
      .get();

    const redeemedIds = order.payment?.walletCreditIds ?? [];
    const redeemed: WalletCredit[] = [];
    for (const creditId of redeemedIds) {
      const snap = await db.collection("wallet_credits").doc(creditId).get();
      if (snap.exists) {
        redeemed.push({ ...(snap.data() as WalletCredit), id: snap.id });
      }
    }

    // Exact amount each credit spent on this order, from the REDEEM ledger.
    // Required to restore partially-consumed credits (which stay ACTIVE but
    // with a reduced amount that no longer reflects what the order spent).
    const ledgerSnap = await db
      .collection("wallet_transactions")
      .where("type", "==", "REDEEM")
      .where("orderId", "==", orderId)
      .get();
    const redeemedLedger = ledgerSnap.docs.map((doc) => {
      const data = doc.data() as Partial<WalletTransaction>;
      return { creditId: String(data.creditId ?? ""), amount: data.amount ?? 0 };
    });

    const earnedCredit = earned.docs[0]
      ? ({ id: earned.docs[0].id, ...earned.docs[0].data() } as WalletCredit)
      : null;

    const customerDocRef = db.collection("customers").doc(uid);

    return await db.runTransaction(async (transaction) => {
      // Idempotency: if this order was already refunded, do nothing. Reads in
      // the transaction make concurrent/clawback retries conflict-safe.
      const orderSnapInTx = await transaction.get(orderRef);
      const orderInTx = orderSnapInTx.exists
        ? (orderSnapInTx.data() as OrderType & { walletRefundedAt?: number })
        : null;
      if (orderInTx?.walletRefundedAt != null) {
        return { success: true, clawbackAmount: 0, restoredAmount: 0 };
      }

      const ctx = createWalletCtx(
        {
          transaction,
          customerDocRef: () => customerDocRef,
          creditsCol: (id?: string) =>
            id
              ? db.collection("wallet_credits").doc(id)
              : db.collection("wallet_credits").doc(),
          transactionsCol: (id?: string) =>
            id
              ? db.collection("wallet_transactions").doc(id)
              : db.collection("wallet_transactions").doc(),
        },
        uid
      );

      const result = await clawbackOnCancellation(
        ctx,
        {
          userId: uid,
          orderId,
          earnedCredit,
          redeemedCredits: redeemed,
          redeemedLedger,
        },
        "manager"
      );

      transaction.update(orderRef, { walletRefundedAt: Date.now() });

      return {
        success: true,
        clawbackAmount: result.clawbackAmount,
        restoredAmount: result.restoredAmount,
      };
    });
  } catch (error) {
    console.error("Server Action [handleOrderClawback]:", error);
    return { success: false, code: "INTERNAL_ERROR" };
  }
}
