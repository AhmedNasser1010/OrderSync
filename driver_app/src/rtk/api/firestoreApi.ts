import { db } from "@/lib/firebase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  runTransaction,
  arrayUnion,
  arrayRemove,
  orderBy,
  limit,
} from "firebase/firestore";
import type { Driver, OrderType, OrderStatusType } from "@ordersync/types";
import { canTransition, getTimelineField, isMarketplaceVisible, isFinalStatus } from "@ordersync/order-utils";

export const firestoreApi = createApi({
  reducerPath: "firestoreApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["UserData", "DriverProfile", "MarketplaceOrders", "MyOrders"],
  endpoints: (builder) => ({
    fetchUserData: builder.query<
      Pick<Driver, "userInfo" | "online">,
      { uid: string }
    >({
      queryFn: (user) => {
        if (!user?.uid) {
          return { error: { message: "No user", data: "" } };
        }
        return new Promise((resolve) => {
          const unsub = onSnapshot(
            doc(db, "drivers", user.uid),
            (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data() as Driver;
                resolve({
                  data: { userInfo: data.userInfo, online: data.online },
                });
              } else {
                resolve({ error: { message: "Driver not found", data: "" } });
              }
              unsub();
            }
          );
        });
      },
      providesTags: ["UserData"],
    }),

    fetchDriverProfile: builder.query<Driver, string>({
      queryFn: async (driverId) => {
        if (!driverId) {
          return { error: { message: "No driver ID provided", data: "" } };
        }
        try {
          const driverRef = doc(db, "drivers", driverId);
          const driverSnapshot = await getDoc(driverRef);

          if (driverSnapshot.exists()) {
            return {
              data: driverSnapshot.data() as Driver,
            };
          } else {
            return { error: { message: "Driver not found", data: "" } };
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Error fetching driver profile:", message);
          return { error: { message, data: "" } };
        }
      },
      providesTags: ["DriverProfile"],
    }),

    // Marketplace: query READY orders from global collection
    fetchMarketplaceOrders: builder.query<OrderType[], string>({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef,
          where("status.current", "==", "READY"),
          orderBy("createdAt", "desc"),
        );

        await cacheDataLoaded;

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            updateCachedData((draft: OrderType[]) => {
              draft.length = 0;
              snapshot.docs.forEach((doc) =>
                draft.push(doc.data() as OrderType),
              );
            });
          },
          (error) => {
            console.error("Error in marketplace listener:", error?.message);
          },
        );

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: ["MarketplaceOrders"],
    }),

    // My active orders: orders assigned to this driver (not yet delivered/canceled)
    fetchMyOrders: builder.query<OrderType[], string>({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(
        driverUid,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        if (!driverUid) return;

        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef,
          where("assignment.driverUid", "==", driverUid),
          where("status.current", "not-in", [
            "DELIVERED",
            "GIVEN_FEEDBACK",
            "CANCELED",
            "REJECTED",
            "VOIDED",
          ]),
        );

        await cacheDataLoaded;

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            updateCachedData((draft: OrderType[]) => {
              draft.length = 0;
              snapshot.docs.forEach((doc) =>
                draft.push(doc.data() as OrderType),
              );
            });
          },
          (error) => {
            console.error("Error in my orders listener:", error?.message);
          },
        );

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: ["MyOrders"],
    }),

    // Transactional: Claim a READY order
    claimOrder: builder.mutation({
      async queryFn({ orderId, driverUid }: { orderId: string; driverUid: string }) {
        try {
          if (!orderId || !driverUid) throw new Error("Order ID and Driver UID required.");

          const orderRef = doc(db, "orders", orderId);
          const driverRef = doc(db, "drivers", driverUid);

          await runTransaction(db, async (transaction) => {
            const orderSnap = await transaction.get(orderRef);
            if (!orderSnap.exists()) throw new Error(`Order not found: ${orderId}`);

            const order = orderSnap.data() as OrderType;

            if (order.status.current !== "READY") {
              throw new Error(`Order is not READY. Current status: ${order.status.current}`);
            }
            if (order.assignment.driverUid) {
              throw new Error("Order already claimed by another driver.");
            }

            const now = Date.now();
            const customerUid = order.customer?.uid;

            transaction.update(orderRef, {
              "assignment.driverUid": driverUid,
              "status.current": "RESERVED",
              "status.history": arrayUnion({
                status: "RESERVED",
                timestamp: now,
                by: `driver:${driverUid}`,
              }),
              "timeline.reservedAt": now,
              updatedAt: now,
            });

            if (customerUid) {
              transaction.update(driverRef, {
                trackingCustomerIds: arrayUnion(customerUid),
              });
            }
          });

          return { data: null };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Error claiming order:", message);
          return { error: { message, data: "" } };
        }
      },
      invalidatesTags: ["MarketplaceOrders", "MyOrders"],
    }),

    // Transactional: Start delivery (RESERVED -> PICKED_UP)
    startDelivery: builder.mutation({
      async queryFn({ orderId, driverUid }: { orderId: string; driverUid: string }) {
        try {
          if (!orderId || !driverUid) throw new Error("Order ID and Driver UID required.");

          const orderRef = doc(db, "orders", orderId);

          await runTransaction(db, async (transaction) => {
            const orderSnap = await transaction.get(orderRef);
            if (!orderSnap.exists()) throw new Error(`Order not found: ${orderId}`);

            const order = orderSnap.data() as OrderType;

            if (order.status.current !== "RESERVED") {
              throw new Error(`Order is not RESERVED. Current status: ${order.status.current}`);
            }
            if (order.assignment.driverUid !== driverUid) {
              throw new Error("You are not assigned to this order.");
            }

            const now = Date.now();

            transaction.update(orderRef, {
              "status.current": "PICKED_UP",
              "status.history": arrayUnion({
                status: "PICKED_UP",
                timestamp: now,
                by: `driver:${driverUid}`,
              }),
              "timeline.pickedUpAt": now,
              updatedAt: now,
            });
          });

          return { data: null };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Error starting delivery:", message);
          return { error: { message, data: "" } };
        }
      },
      invalidatesTags: ["MyOrders"],
    }),

    // Transactional: Complete delivery (PICKED_UP -> DELIVERED)
    completeDelivery: builder.mutation({
      async queryFn({ orderId, driverUid }: { orderId: string; driverUid: string }) {
        try {
          if (!orderId || !driverUid) throw new Error("Order ID and Driver UID required.");

          const orderRef = doc(db, "orders", orderId);
          const driverRef = doc(db, "drivers", driverUid);

          await runTransaction(db, async (transaction) => {
            const orderSnap = await transaction.get(orderRef);
            if (!orderSnap.exists()) throw new Error(`Order not found: ${orderId}`);

            const order = orderSnap.data() as OrderType;

            if (order.status.current !== "PICKED_UP") {
              throw new Error(`Order is not PICKED_UP. Current status: ${order.status.current}`);
            }
            if (order.assignment.driverUid !== driverUid) {
              throw new Error("You are not assigned to this order.");
            }

            const now = Date.now();
            const customerUid = order.customer?.uid;

            transaction.update(orderRef, {
              "status.current": "DELIVERED",
              "status.history": arrayUnion({
                status: "DELIVERED",
                timestamp: now,
                by: `driver:${driverUid}`,
              }),
              "timeline.deliveredAt": now,
              updatedAt: now,
            });

            if (customerUid) {
              transaction.update(driverRef, {
                trackingCustomerIds: arrayRemove(customerUid),
              });
            }
          });

          return { data: null };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Error completing delivery:", message);
          return { error: { message, data: "" } };
        }
      },
      invalidatesTags: ["MyOrders"],
    }),

    // Transactional: Cancel order (any active status -> CANCELED)
    cancelOrder: builder.mutation({
      async queryFn({ orderId, driverUid }: { orderId: string; driverUid: string }) {
        try {
          if (!orderId || !driverUid) throw new Error("Order ID and Driver UID required.");

          const orderRef = doc(db, "orders", orderId);
          const driverRef = doc(db, "drivers", driverUid);

          await runTransaction(db, async (transaction) => {
            const orderSnap = await transaction.get(orderRef);
            if (!orderSnap.exists()) throw new Error(`Order not found: ${orderId}`);

            const order = orderSnap.data() as OrderType;

            if (!canTransition(order.status.current, "CANCELED")) {
              throw new Error(`Cannot cancel order in status: ${order.status.current}`);
            }
            if (order.assignment.driverUid !== driverUid) {
              throw new Error("You are not assigned to this order.");
            }

            const now = Date.now();
            const timelineField = getTimelineField("CANCELED");
            const customerUid = order.customer?.uid;

            transaction.update(orderRef, {
              "status.current": "CANCELED",
              "status.history": arrayUnion({
                status: "CANCELED",
                timestamp: now,
                by: `driver:${driverUid}`,
              }),
              [`timeline.${timelineField}`]: now,
              updatedAt: now,
            });

            if (customerUid) {
              transaction.update(driverRef, {
                trackingCustomerIds: arrayRemove(customerUid),
              });
            }
          });

          return { data: null };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Error canceling order:", message);
          return { error: { message, data: "" } };
        }
      },
      invalidatesTags: ["MyOrders", "MarketplaceOrders"],
    }),
  }),
});

export const {
  useFetchDriverProfileQuery,
  useLazyFetchDriverProfileQuery,
  useLazyFetchUserDataQuery,
  useFetchUserDataQuery,
  useFetchMarketplaceOrdersQuery,
  useFetchMyOrdersQuery,
  useClaimOrderMutation,
  useStartDeliveryMutation,
  useCompleteDeliveryMutation,
  useCancelOrderMutation,
} = firestoreApi;
