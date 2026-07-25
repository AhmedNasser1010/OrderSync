import { doc, increment, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const trackDiscountImpression = async ({
  discountId,
  restaurantId,
}) => {
  try {
    const docId = `${discountId}_${getCurrentMonthKey()}`;
    const analyticsRef = doc(db, "discountAnalytics", docId);
    await setDoc(
      analyticsRef,
      {
        impressions: increment(1),
        discountId,
        restaurantId,
        period: getCurrentMonthKey(),
      },
      { merge: true }
    );
  } catch {
    // Document may not exist yet — silently fail
  }
};
