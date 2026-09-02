"use server";

import { initAdmin } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import {
  createWalletCtx,
  grantCredit,
  DEFAULT_WIPE_DAYS,
  DAY_MS,
} from "@ordersync/order-utils";
import type { OrderType, CashbackConfig } from "@ordersync/types";

export type GrantCashbackResult =
  | { success: true; amount: number; granted: boolean }
  | { success: false; code: string };

/**
 * Grants cash back on a delivered order. Called by the driver app immediately
 * after the delivery transaction completes. Idempotent: if the order already
 * carried cashback, it is not granted twice. Runs under the Admin SDK so it can
 * write the wallet_credits ledger (which clients cannot).
 */
export async function grantOrderCashback(
  orderId: string
): Promise<GrantCashbackResult> {
  try {
    if (!orderId) return { success: false, code: "INVALID_ORDER" };

    const app = await initAdmin();
    const db = getFirestore(app);

    const orderRef = db.collection("orders").doc(orderId);

    return await db.runTransaction(async (transaction) => {
      const orderSnap = await transaction.get(orderRef);
      if (!orderSnap.exists) return { success: false, code: "ORDER_NOT_FOUND" };
      const order = orderSnap.data() as OrderType;

      if (order.status?.current !== "DELIVERED") {
        return { success: false, code: "NOT_DELIVERED" };
      }
      // Idempotency: cashback already granted for this order.
      if (order.pricing?.cashbackEarned != null) {
        return { success: true, amount: order.pricing.cashbackEarned, granted: false };
      }

      const uid = order.customerUid ?? order.customer?.uid;
      if (!uid) return { success: false, code: "NO_CUSTOMER" };

      const servicesRef = db.collection("services").doc("platform");
      const servicesSnap = await transaction.get(servicesRef);
      const config = (servicesSnap.data() ?? {}) as { cashback?: CashbackConfig };
      const cb = config.cashback ?? {
        enabled: false,
        cashbackPercent: 0,
        wipeDays: 90,
        redemptionThreshold: 0,
        maxCashbackPerTx: 0,
      };
      if (!cb.enabled) return { success: true, amount: 0, granted: false };

      // Cash back cannot be earned on a cart that carried a discount/promo.
      const hasDiscount =
        (order.pricing?.discount ?? 0) > 0 ||
        (order.pricing as { promoCode?: string })?.promoCode != null;
      if (hasDiscount) return { success: true, amount: 0, granted: false };

      const foodRevenue = (order.pricing?.subtotal ?? 0) - (order.pricing?.discount ?? 0);
      if (foodRevenue <= 0) return { success: true, amount: 0, granted: false };

      const cashbackAmount = Math.round(
        foodRevenue * (cb.cashbackPercent / 100) * 100
      ) / 100;
      if (cashbackAmount <= 0) return { success: true, amount: 0, granted: false };

      const wipeDays = cb.wipeDays > 0 ? cb.wipeDays : DEFAULT_WIPE_DAYS;
      const expiresAt = Date.now() + wipeDays * DAY_MS;

      const customerDocRef = db.collection("customers").doc(uid);
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

      await grantCredit(ctx, {
        userId: uid,
        amount: cashbackAmount,
        expiresAt,
        source: "ORDER_EARN",
        orderId,
      });

      transaction.update(orderRef, {
        "pricing.cashbackEarned": cashbackAmount,
      });

      return { success: true, amount: cashbackAmount, granted: true };
    });
  } catch (error) {
    console.error("Server Action [grantOrderCashback]:", error);
    return { success: false, code: "INTERNAL_ERROR" };
  }
}
