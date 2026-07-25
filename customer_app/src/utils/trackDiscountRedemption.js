import { doc, increment, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "../config/firebase";

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const trackDiscountRedemption = async ({
  discountId,
  restaurantId,
  userId,
  orderId,
  amount,
}) => {
  try {
    const docId = `${discountId}_${getCurrentMonthKey()}`;
    const analyticsRef = doc(db, "discountAnalytics", docId);

    await setDoc(
      analyticsRef,
      {
        discountId,
        restaurantId,
        period: getCurrentMonthKey(),
        redemptions: increment(1),
        revenueImpact: increment(amount),
        uniqueUsers: arrayUnion(userId),
      },
      { merge: true }
    );

    const redemptionRef = doc(db, "discountRedemptions", orderId);
    await setDoc(redemptionRef, {
      id: orderId,
      discountId,
      userId,
      orderId,
      restaurantId,
      amount,
      createdAt: Date.now(),
    });
  } catch (err) {
    console.error("Failed to track discount redemption:", err);
  }
};
