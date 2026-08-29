import { db, auth } from "@/lib/firebase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  runTransaction,
  arrayUnion,
  arrayRemove,
  orderBy,
  deleteField,
  updateDoc,
  increment,
} from "firebase/firestore";
import type { Driver, OrderType } from "@ordersync/types";
import { canTransition } from "@ordersync/order-utils";

export const firestoreApi = createApi({
  reducerPath: "firestoreApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["UserData", "DriverProfile", "MarketplaceOrders", "MyOrders", "PreparingOrders", "BusinessNames"],
  endpoints: (builder) => ({
    fetchUserData: builder.query<
      Pick<
        Driver,
        "userInfo" | "online" | "finance" | "theme" | "locale" | "notifyPush" | "skipStartRoute" | "visibleBusinessIds"
      >,
      { uid: string }
    >({
      queryFn: () => ({ data: { userInfo: {} as Driver["userInfo"], online: { byManager: false, byUser: false }, finance: { currentCash: 0, dailyAdvance: 0, dailyAdvanceDate: 0, earnings: 0 } } }),
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
                finance: data.finance,
                theme: data.theme,
                locale: data.locale,
                notifyPush: data.notifyPush,
                skipStartRoute: data.skipStartRoute,
                visibleBusinessIds: data.visibleBusinessIds ?? [],
              }));
            }
          },
          (error) => {
            if (auth.currentUser) {
              console.error("Error in user data listener:", error?.message);
            }
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
          where("status.returnedByDriverUid", "==", null),
          where("marketplaceHidden", "in", [false, null]),
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
            if (auth.currentUser) {
              console.error("Error in marketplace listener:", error?.message);
            }
          },
        );

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: ["MarketplaceOrders"],
    }),

    // Preparing orders: shown as "almost ready" preview when marketplace is empty
    fetchPreparingOrders: builder.query<OrderType[], void>({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef,
          where("status.current", "==", "PREPARING"),
          where("marketplaceHidden", "in", [false, null]),
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
            if (auth.currentUser) {
              console.error("Error in preparing orders listener:", error?.message);
            }
          },
        );

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: ["PreparingOrders"],
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
            if (auth.currentUser) {
              console.error("Error in my orders listener:", error?.message);
            }
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
            const restaurantShare = order.finance?.restaurantShare ?? 0;

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
            if (restaurantShare > 0) {
              driverUpdate["finance.currentCash"] = increment(-restaurantShare);
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

    // Transactional: Claim multiple READY orders in a single transaction
    claimOrdersBatch: builder.mutation({
      async queryFn({
        orderIds,
        driverUid,
      }: {
        orderIds: string[];
        driverUid: string;
      }) {
        try {
          if (!orderIds.length || !driverUid)
            throw new Error("Order IDs and Driver UID required.");

          const driverRef = doc(db, "drivers", driverUid);

          await runTransaction(db, async (transaction) => {
            const orderRefs = orderIds.map((id) => doc(db, "orders", id));
            const orderSnaps = await Promise.all(
              orderRefs.map((ref) => transaction.get(ref)),
            );

            for (let i = 0; i < orderSnaps.length; i++) {
              const snap = orderSnaps[i];
              if (!snap.exists())
                throw new Error(`Order not found: ${orderIds[i]}`);
              const order = snap.data() as OrderType;
              if (order.status.current !== "READY")
                throw new Error(
                  `Order ${orderIds[i]} is not READY. Current: ${order.status.current}`,
                );
              if (order.assignment?.driverUid)
                throw new Error(
                  `Order ${orderIds[i]} already claimed.`,
                );
            }

            const now = Date.now();
            const customerUids: string[] = [];
            let businessId = "";
            let totalRestaurantShare = 0;

            for (let i = 0; i < orderSnaps.length; i++) {
              const order = orderSnaps[i].data() as OrderType;
              const orderRef = orderRefs[i];

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

              if (!businessId && order.businessId) {
                businessId = order.businessId;
              }
              if (order.customer?.uid) {
                customerUids.push(order.customer.uid);
              }
              totalRestaurantShare += order.finance?.restaurantShare ?? 0;
            }

            const driverUpdate: Record<string, unknown> = {};
            if (businessId) {
              driverUpdate.accessToken = businessId;
            }
            if (customerUids.length > 0) {
              driverUpdate.trackingCustomerIds =
                arrayUnion(...customerUids);
            }
            if (totalRestaurantShare > 0) {
              driverUpdate["finance.currentCash"] = increment(-totalRestaurantShare);
            }
            if (Object.keys(driverUpdate).length > 0) {
              transaction.update(driverRef, driverUpdate);
            }
          });

          return { data: null };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Error batch claiming orders:", message);
          return { error: { message, data: "" } };
        }
      },
      invalidatesTags: ["MarketplaceOrders", "MyOrders"],
    }),

    // Transactional: Start delivery (RESERVED -> PICKED_UP, or -> ON_ROUTE when skipStartRoute)
    startDelivery: builder.mutation({
      async queryFn({ orderId, driverUid, skipStartRoute }: { orderId: string; driverUid: string; skipStartRoute?: boolean }) {
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
            if (!canTransition(order.status.current, "PICKED_UP")) {
              throw new Error(`Cannot start delivery from status: ${order.status.current}`);
            }
            if (order.assignment?.driverUid !== driverUid) {
              throw new Error("You are not assigned to this order.");
            }

            const now = Date.now();

            if (skipStartRoute) {
              transaction.update(orderRef, {
                "status.current": "ON_ROUTE",
                "status.history": arrayUnion(
                  { status: "PICKED_UP", timestamp: now, by: `driver:${driverUid}` },
                  { status: "ON_ROUTE", timestamp: now, by: `driver:${driverUid}` },
                ),
                "timeline.pickedUpAt": now,
                "timeline.onRouteAt": now,
                updatedAt: now,
              });
            } else {
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
            }
          });

          return { data: null };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Error starting delivery:", message);
          return { error: { message, data: "" } };
        }
      },
    }),

    // Transactional: Start route (PICKED_UP -> ON_ROUTE)
    startRoute: builder.mutation({
      async queryFn({ orderId, driverUid }: { orderId: string; driverUid: string }) {
        try {
          if (!orderId || !driverUid) throw new Error("Order ID and Driver UID required.");

          const orderRef = doc(db, "orders", orderId);

          await runTransaction(db, async (transaction) => {
            const orderSnap = await transaction.get(orderRef);
            if (!orderSnap.exists()) throw new Error(`Order not found: ${orderId}`);

            const order = orderSnap.data() as OrderType;

            if (order.status.current !== "PICKED_UP") {
              throw new Error(`Order is not PICKED_UP. Current status: ${order.status.current}`);
            }
            if (!canTransition(order.status.current, "ON_ROUTE")) {
              throw new Error(`Cannot start route from status: ${order.status.current}`);
            }
            if (order.assignment?.driverUid !== driverUid) {
              throw new Error("You are not assigned to this order.");
            }

            const now = Date.now();

            transaction.update(orderRef, {
              "status.current": "ON_ROUTE",
              "status.history": arrayUnion({
                status: "ON_ROUTE",
                timestamp: now,
                by: `driver:${driverUid}`,
              }),
              "timeline.onRouteAt": now,
              updatedAt: now,
            });
          });

          return { data: null };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Error starting route:", message);
          return { error: { message, data: "" } };
        }
      },
    }),

    // Transactional: Complete delivery (ON_ROUTE -> DELIVERED)
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

            if (order.status.current !== "ON_ROUTE") {
              throw new Error(`Order is not ON_ROUTE. Current status: ${order.status.current}`);
            }
            if (!canTransition(order.status.current, "DELIVERED")) {
              throw new Error(`Cannot complete delivery from status: ${order.status.current}`);
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
              "finance.currentCash": increment(order.pricing?.total ?? 0),
              "finance.earnings": increment(
                (order.finance?.driverEarnings ?? order.pricing?.deliveryFees ?? 0)
                + (order.finance?.commissionAmount ?? 0)
              ),
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
    }),

    // Transactional: Return an order to the restaurant (RESERVED/PICKED_UP/ON_ROUTE -> READY).
    // The order is marked as returned by this driver and stays restaurant-only
    // until the restaurant re-releases it back to the marketplace.
    releaseOrder: builder.mutation({
      async queryFn({ orderId, driverUid }: { orderId: string; driverUid: string }) {
        try {
          if (!orderId || !driverUid) throw new Error("Order ID and Driver UID required.");

          const orderRef = doc(db, "orders", orderId);
          const driverRef = doc(db, "drivers", driverUid);

          await runTransaction(db, async (transaction) => {
            const orderSnap = await transaction.get(orderRef);
            if (!orderSnap.exists()) throw new Error(`Order not found: ${orderId}`);

            const order = orderSnap.data() as OrderType;

            if (!["RESERVED", "PICKED_UP", "ON_ROUTE"].includes(order.status.current)) {
              throw new Error(`Cannot return order in status: ${order.status.current}`);
            }
            if (order.assignment?.driverUid !== driverUid) {
              throw new Error("You are not assigned to this order.");
            }

            const now = Date.now();
            const customerUid = order.customer?.uid;
            const restaurantShare = order.finance?.restaurantShare ?? 0;

            transaction.update(orderRef, {
              "status.current": "READY",
              "status.returnedByDriverUid": driverUid,
              "status.history": arrayUnion({
                status: "READY",
                timestamp: now,
                by: `driver:${driverUid}`,
              }),
              "timeline.readyAt": now,
              "assignment.driverUid": null,
              updatedAt: now,
            });

            const driverUpdate: Record<string, unknown> = {
              accessToken: deleteField(),
            };
            if (customerUid) {
              driverUpdate.trackingCustomerIds = arrayRemove(customerUid);
            }
            if (restaurantShare > 0) {
              driverUpdate["finance.currentCash"] = increment(restaurantShare);
            }
            transaction.update(driverRef, driverUpdate);
          });

          return { data: null };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Error returning order:", message);
          return { error: { message, data: "" } };
        }
      },
      invalidatesTags: ["MarketplaceOrders", "MyOrders"],
    }),

    fetchBusinessNames: builder.query<
      Record<string, { nameInAr: string; cookTime?: [number, number] }>,
      string[]
    >({
      async queryFn(businessIds) {
        if (!businessIds.length) return { data: {} };
        try {
          const uniqueIds = [...new Set(businessIds)];
          if (uniqueIds.length === 0) return { data: {} };
          const refs = uniqueIds.map((id) => doc(db, "businesses", id));
          const snapshots = await Promise.all(
            refs.map((ref) => getDoc(ref)),
          );
          const result: Record<string, { nameInAr: string; cookTime?: [number, number] }> = {};
          for (let i = 0; i < uniqueIds.length; i++) {
            const snap = snapshots[i];
            if (snap.exists()) {
              const data = snap.data();
              const nameInAr = data?.profile?.nameInAr;
              const cookTime = data?.operations?.cookTime;
              if (nameInAr || cookTime) {
                result[uniqueIds[i]] = { nameInAr, cookTime };
              }
            }
          }
          return { data: result };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Error fetching business names:", message);
          return { error: { message, data: "" } };
        }
      },
      providesTags: (_result, _error, ids) =>
        ids.map((id) => ({ type: "BusinessNames" as const, id })),
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
  useFetchPreparingOrdersQuery,
  useClaimOrderMutation,
  useClaimOrdersBatchMutation,
  useStartDeliveryMutation,
  useCompleteDeliveryMutation,
  useStartRouteMutation,
  useReleaseOrderMutation,
  useToggleOnlineStatusMutation,
  useFetchBusinessNamesQuery,
} = firestoreApi;
