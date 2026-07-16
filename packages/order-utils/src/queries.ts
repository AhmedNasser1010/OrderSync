import {
  collection,
  doc,
  query,
  where,
  orderBy,
  type Firestore,
} from "firebase/firestore";

export function restaurantActiveOrders(db: Firestore, businessId: string) {
  return query(
    collection(db, "orders"),
    where("businessId", "==", businessId),
    where("status.current", "not-in", [
      "DELIVERED",
      "GIVEN_FEEDBACK",
      "CANCELED",
      "REJECTED",
      "VOIDED",
    ]),
  );
}

export function marketplaceOrders(db: Firestore) {
  return query(
    collection(db, "orders"),
    where("status.current", "==", "READY"),
  );
}

export function driverActiveOrders(db: Firestore, driverUid: string) {
  return query(
    collection(db, "orders"),
    where("assignment.driverUid", "==", driverUid),
    where("status.current", "in", ["RESERVED", "PICKED_UP", "ON_ROUTE"]),
  );
}

export function customerOrders(db: Firestore, customerUid: string) {
  return query(
    collection(db, "orders"),
    where("customerUid", "==", customerUid),
    orderBy("createdAt", "desc"),
  );
}

export function restaurantDeliveredOrders(db: Firestore, businessId: string) {
  return query(
    collection(db, "orders"),
    where("businessId", "==", businessId),
    where("status.current", "in", ["DELIVERED", "GIVEN_FEEDBACK"]),
  );
}

export function restaurantUnpaidOrders(db: Firestore, businessId: string) {
  return query(
    collection(db, "orders"),
    where("businessId", "==", businessId),
    where("reconciliation.restaurantPaid", "==", false),
  );
}

export function driverUnsettledOrders(db: Firestore, driverUid: string) {
  return query(
    collection(db, "orders"),
    where("assignment.driverUid", "==", driverUid),
    where("reconciliation.settlementId", "==", null),
    where("status.current", "in", ["DELIVERED", "GIVEN_FEEDBACK"]),
  );
}

export function ordersForDateRange(
  db: Firestore,
  businessId: string,
  startMs: number,
  endMs: number,
) {
  return query(
    collection(db, "orders"),
    where("businessId", "==", businessId),
    where("timeline.deliveredAt", ">=", startMs),
    where("timeline.deliveredAt", "<", endMs),
  );
}

export function getDailyReportRef(
  db: Firestore,
  businessId: string,
  dateStr: string,
) {
  return doc(collection(db, "dailyReports"), `${businessId}_${dateStr}`);
}
