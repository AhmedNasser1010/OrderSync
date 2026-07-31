"use server";

import { initAdmin } from "@/lib/firebase-admin";
import { getMessaging } from "firebase-admin/messaging";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

type SendMarketplacePushResult = {
  success: boolean;
  error?: string;
  sentCount?: number;
};

export async function sendMarketplacePush(
  orderNumber?: number,
): Promise<SendMarketplacePushResult> {
  try {
    if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
      return { success: false, error: "Push disabled in emulator mode." };
    }

    const app = await initAdmin();
    const messaging = getMessaging(app);
    const db = getFirestore(app);

    const driversSnapshot = await db
      .collection("drivers")
      .where("online.byManager", "==", true)
      .get();

    const tokenOwnerMap = new Map<string, string>();
    const tokens: string[] = [];

    driversSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.online?.byUser !== true) return;
      if (data.notifyPush === false) return;

      const driverTokens: string[] = Array.isArray(data.fcmTokens)
        ? data.fcmTokens
        : [];
      for (const token of driverTokens) {
        tokens.push(token);
        tokenOwnerMap.set(token, docSnap.id);
      }
    });

    if (tokens.length === 0) {
      return { success: false, error: "No online drivers with FCM tokens." };
    }

    const response = await messaging.sendEachForMulticast({
      notification: {
        title: "New Order Available",
        body: orderNumber
          ? `Order #${orderNumber} is ready for pickup.`
          : "A new order is ready for pickup.",
      },
      tokens,
    });

    const staleTokensByDriver = new Map<string, string[]>();

    response.responses.forEach((resp, idx) => {
      if (
        !resp.success &&
        resp.error?.code === "messaging/invalid-registration-token"
      ) {
        const token = tokens[idx];
        const driverId = tokenOwnerMap.get(token);
        if (!driverId) return;
        const existing = staleTokensByDriver.get(driverId) ?? [];
        existing.push(token);
        staleTokensByDriver.set(driverId, existing);
      }
    });

    if (staleTokensByDriver.size > 0) {
      for (const [driverId, staleTokens] of staleTokensByDriver) {
        const driverRef = db.collection("drivers").doc(driverId);
        await driverRef.update({
          fcmTokens: FieldValue.arrayRemove(...staleTokens),
        });
      }
    }

    console.log(
      "Server Action [sendMarketplacePush]: Sent marketplace push - success count:",
      response.successCount,
    );

    return {
      success: true,
      sentCount: response.successCount,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error sending marketplace push:", message);
    return { success: false, error: message };
  }
}
