"use server";

import { initAdmin } from "@/lib/firebase-admin";
import { getMessaging } from "firebase-admin/messaging";
import { getFirestore } from "firebase-admin/firestore";

type SendPushResult = {
  success: boolean;
  error?: string;
  sentCount?: number;
};

export async function sendPushToDriver(
  driverUid: string,
  title: string,
  body: string,
): Promise<SendPushResult> {
  try {
    if (!driverUid) {
      return { success: false, error: "Driver UID is required." };
    }

    const app = await initAdmin();
    const messaging = getMessaging(app);
    const db = getFirestore(app);

    const driverRef = db.collection("drivers").doc(driverUid);
    const driverSnap = await driverRef.get();

    if (!driverSnap.exists) {
      return { success: false, error: "Driver not found." };
    }

    const driverData = driverSnap.data();
    const tokens: string[] = driverData?.fcmTokens ?? [];

    if (tokens.length === 0) {
      return { success: false, error: "No FCM tokens registered for this driver." };
    }

    if (driverData?.notifyPush === false) {
      return { success: false, error: "Driver has push notifications disabled." };
    }

    const message = {
      notification: { title, body },
      tokens,
    };

    const response = await messaging.sendEachForMulticast(message);

    const staleTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (
        !resp.success &&
        resp.error?.code === "messaging/invalid-registration-token"
      ) {
        staleTokens.push(tokens[idx]);
      }
    });

    if (staleTokens.length > 0) {
      await driverRef.update({
        fcmTokens: staleTokens.reduce(
          (acc: Record<string, unknown>, token: string) => {
            acc[token] = false;
            return acc;
          },
          {},
        ),
      });
    }

    console.log(
      "Server Action [sendPushToDriver]: Sent push to driver",
      driverUid,
      "- success count:",
      response.successCount,
    );

    return {
      success: true,
      sentCount: response.successCount,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error sending push notification:", message);
    return { success: false, error: message };
  }
}
