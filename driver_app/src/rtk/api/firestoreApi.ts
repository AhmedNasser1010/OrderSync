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
  deleteField,
  updateDoc,
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
      queryFn: () => ({ data: { userInfo: {} as Driver["userInfo"], online: { byManager: false, byUser: false } } }),
      async onCacheEntryAdded(
        user,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        if (!user?.uid) return;

        const driverRef = doc(db, "drivers", user.uid);

        await cacheDataLoaded;

        const unsubscribe = onSnapshot(
          driverRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as Driver;
              updateCachedData(() => ({
                userInfo: data.userInfo,
                online: data.online,
              }));
            }
          },
          (error) => {
            console.error("Error in user data listener:", error?.message);
          },
        );

        await cacheEntryRemoved;
        unsubscribe();
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
            if (order.assignment?.driverUid) {
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

            const driverUpdate: Record<string, unknown> = {};
            if (order.businessId) {
              driverUpdate.accessToken = order.businessId;
            }
            if (customerUid) {
              driverUpdate.trackingCustomerIds = arrayUnion(customerUid);
            }
            if (Object.keys(driverUpdate).length > 0) {
              transaction.update(driverRef, driverUpdate);
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
            if (order.assignment?.driverUid !== driverUid) {
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
            if (order.assignment?.driverUid !== driverUid) {
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

            const driverUpdate: Record<string, unknown> = {
              accessToken: deleteField(),
            };
            if (customerUid) {
              driverUpdate.trackingCustomerIds = arrayRemove(customerUid);
            }
            transaction.update(driverRef, driverUpdate);
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
      async queryFn({ orderId, driverUid, reason }: { orderId: string; driverUid: string; reason?: string }) {
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
            if (order.assignment?.driverUid !== driverUid) {
              throw new Error("You are not assigned to this order.");
            }

            const now = Date.now();
            const timelineField = getTimelineField("CANCELED");
            const customerUid = order.customer?.uid;

            const updateData: Record<string, unknown> = {
              "status.current": "CANCELED",
              "status.history": arrayUnion({
                status: "CANCELED",
                timestamp: now,
                by: `driver:${driverUid}`,
              }),
              [`timeline.${timelineField}`]: now,
              updatedAt: now,
            };

            if (reason) {
              updateData["status.cancellationReason"] = reason;
            }

            transaction.update(orderRef, updateData);

            const driverUpdate: Record<string, unknown> = {
              accessToken: deleteField(),
            };
            if (customerUid) {
              driverUpdate.trackingCustomerIds = arrayRemove(customerUid);
            }
            transaction.update(driverRef, driverUpdate);
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

    toggleOnlineStatus: builder.mutation<
      boolean,
      { uid: string; byUser: boolean }
    >({
      queryFn: async ({ uid, byUser }) => {
        try {
          if (!uid) throw new Error("Driver UID required.");
          const driverRef = doc(db, "drivers", uid);
          await updateDoc(driverRef, {
            "online.byUser": byUser,
            updatedAt: Date.now(),
          });
          return { data: byUser };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Error toggling online status:", message);
          return { error: { message, data: "" } };
        }
      },
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
  useToggleOnlineStatusMutation,
} = firestoreApi;
