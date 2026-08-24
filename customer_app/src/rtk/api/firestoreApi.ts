import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  canTransition,
  getTimelineField,
} from "@ordersync/order-utils";
import type { HeroBanner, OrderType, ServicesDocument } from "@ordersync/types";
import { setHasOrder } from "@/rtk/slices/toggleSlice";

interface TrackedOrderArg {
  orderId?: string | null;
  resId?: string | null;
  uid?: string | null;
}

const trackedOrderCacheReader: {
  read?: (arg: TrackedOrderArg, state: unknown) => Partial<OrderType> | undefined;
} = {};

const clearTrackedOrderIfMatching = async (uid: string, orderId: string) => {
  const customerRef = doc(db, "customers", uid);

  await runTransaction(db, async (transaction) => {
    const customerSnap = await transaction.get(customerRef);
    if (!customerSnap.exists()) return;

    const customerData = customerSnap.data() as { trackedOrder?: { id?: string | null } };

    if (customerData?.trackedOrder?.id === orderId) {
      transaction.update(customerRef, {
        "trackedOrder.id": null,
      });
    }
  });
};

interface CancelOrderArg {
  orderId: string;
  uid?: string | null;
}

interface OrderFeedbackArg {
  orderId?: string | null;
  uid?: string | null;
  resId?: string | null;
  feedback: { rating: number; comment?: string };
}

export const firestoreApi = createApi({
  reducerPath: "firestoreApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    "OrderTracking",
    "User",
    "Restaurants",
    "Menu",
    "Banners",
    "Services",
    "LastOrder",
  ],
  endpoints: (builder) => ({
    // =====================================================================
    // Query Endpoints
    // =====================================================================

    fetchBanners: builder.query<HeroBanner[], void>({
      async queryFn() {
        try {
          const bannersRef = collection(db, "banners");
          const q = query(
            bannersRef,
            where("active", "==", true),
            orderBy("sortOrder", "asc"),
          );
          const snapshot = await getDocs(q);
          return {
            data: snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() }) as HeroBanner,
            ),
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["Banners"],
    }),

    fetchBusinesses: builder.query<unknown[], void>({
      async queryFn() {
        try {
          const businessesRef = collection(db, "businesses");
          const snapshot = await getDocs(businessesRef);
          return {
            data: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["Restaurants"],
    }),

    fetchMenuData: builder.query<Record<string, unknown> | null, string>({
      async queryFn(resId) {
        try {
          const menuRef = doc(db, "menus", resId);
          const menuSnapshot = await getDoc(menuRef);
          return { data: menuSnapshot.exists() ? menuSnapshot.data() : null };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["Menu"],
    }),

    fetchServices: builder.query<
      {
        deliveryFees: ServicesDocument["deliveryFeesPerKm"];
        minDeliveryFees: ServicesDocument["minDeliveryFees"];
      },
      void
    >({
      queryFn: () => ({
        data: {
          deliveryFees: 3.5,
          minDeliveryFees: 5,
        },
      }),
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        await cacheDataLoaded;

        const servicesRef = doc(db, "services", "platform");

        const unsubscribe = onSnapshot(
          servicesRef,
          (docSnapshot) => {
            updateCachedData((draft) => {
              if (docSnapshot.exists()) {
                const data = docSnapshot.data() as Partial<ServicesDocument>;
                draft.deliveryFees = data.deliveryFeesPerKm ?? 3.5;
                draft.minDeliveryFees = data.minDeliveryFees ?? 5;
              } else {
                draft.deliveryFees = 3.5;
                draft.minDeliveryFees = 5;
              }
            });
          },
          (error) => {
            console.error(
              "Error in real-time listener [services]:",
              error?.message
            );
          }
        );

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: ["Services"],
    }),

    fetchOrderTrackingData: builder.query<Partial<OrderType>, TrackedOrderArg>({
      queryFn: (_arg, { getState }) => {
        const existing = trackedOrderCacheReader.read?.(_arg, getState());
        return { data: existing ?? ({} as Partial<OrderType>) };
      },
      async onCacheEntryAdded(
        { orderId },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        await cacheDataLoaded;

        if (!orderId) {
          dispatch(setHasOrder(false));
          return;
        }

        const orderRef = doc(db, "orders", orderId);

        const unsubscribe = onSnapshot(
          orderRef,
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              const data = docSnapshot.data() as Partial<OrderType>;
              updateCachedData((draft) => {
                Object.assign(draft, data);
              });
              dispatch(setHasOrder(true));
            } else {
              updateCachedData((draft) => {
                Object.keys(draft).forEach((k) => delete draft[k as keyof typeof draft]);
              });
              dispatch(setHasOrder(false));
            }
          },
          (error) => {
            console.error(
              "Error in real-time listener [orderTracking]:",
              error?.message
            );
          }
        );

        await cacheEntryRemoved;
        unsubscribe();
      },
      keepUnusedDataFor: 0,
    }),

    fetchLastOrder: builder.query<Partial<OrderType> | null, string>({
      async queryFn(uid) {
        try {
          const ordersRef = collection(db, "orders");
          // Must filter on customer.uid (not top-level customerUid):
          // security rules permit listing only queries constrained by
          // resourceData().customer.uid == request.auth.uid.
          const q = query(
            ordersRef,
            where("customer.uid", "==", uid),
            orderBy("createdAt", "desc"),
            limit(1)
          );
          const snapshot = await getDocs(q);
          if (snapshot.empty) return { data: null };
          const orderDoc = snapshot.docs[0];
          return {
            data: { id: orderDoc.id, ...orderDoc.data() } as Partial<OrderType>,
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error("Error fetching last order:", message);
          return { error: message };
        }
      },
      providesTags: ["LastOrder"],
    }),

    // =====================================================================
    // Mutation Endpoints
    // =====================================================================

    cancelOrder: builder.mutation<null, CancelOrderArg>({
      async queryFn({ orderId, uid }) {
        try {
          if (!orderId || !uid)
            throw new Error("Order ID and user ID required.");

          const orderRef = doc(db, "orders", orderId);

          await runTransaction(db, async (transaction) => {
            const orderSnap = await transaction.get(orderRef);
            if (!orderSnap.exists()) {
              throw new Error("Order not found.");
            }

            const order = orderSnap.data() as OrderType;

            if (!canTransition(order.status.current, "CANCELED")) {
              throw new Error(
                `Cannot cancel order in status: ${order.status.current}`
              );
            }

            const now = Date.now();
            const timelineField = getTimelineField("CANCELED");

            transaction.update(orderRef, {
              "status.current": "CANCELED",
              "status.history": arrayUnion({
                status: "CANCELED",
                timestamp: now,
                by: "customer",
              }),
              [`timeline.${timelineField}`]: now,
              updatedAt: now,
            });
          });

          await clearTrackedOrderIfMatching(uid, orderId);

          return { data: null };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error("Error canceling order:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["OrderTracking"],
    }),

    setOrderFeedback: builder.mutation<null, OrderFeedbackArg>({
      async queryFn({ orderId, uid, feedback, resId }) {
        try {
          if (!orderId || !uid || !resId) {
            throw new Error("Missing feedback parameters");
          }

          const orderRef = doc(db, "orders", orderId);
          const reviewRef = doc(db, "reviews", orderId);
          const businessRef = doc(db, "businesses", resId);

          const rating = feedback.rating === 0 ? null : feedback.rating;
          const comment =
            feedback.comment && feedback.comment.length > 0
              ? feedback.comment
              : null;

          if (!rating && !comment) {
            return { data: null };
          }

          const businessDoc = await getDoc(businessRef);

          if (!businessDoc.exists()) {
            throw new Error(`Business document not found: ${resId}`);
          }

          await runTransaction(db, async (transaction) => {
            const orderSnap = await transaction.get(orderRef);
            const reviewSnap = await transaction.get(reviewRef);
            const businessSnap = await transaction.get(businessRef);

            if (!orderSnap.exists()) {
              throw new Error("Order not found.");
            }

            if (reviewSnap.exists()) {
              throw new Error("Review already exists for this order");
            }

            const order = orderSnap.data() as OrderType;

            if (!canTransition(order.status.current, "GIVEN_FEEDBACK")) {
              throw new Error(
                `Cannot give feedback for order in status: ${order.status.current}`
              );
            }

            const timestamp = Date.now();

            transaction.set(reviewRef, {
              orderId,
              restaurantId: resId,
              customerId: uid,
              rating,
              comment,
              createdAt: timestamp,
            });

            transaction.update(orderRef, {
              customerFeedback: { rating, comment },
              "status.current": "GIVEN_FEEDBACK",
              "status.history": arrayUnion({
                status: "GIVEN_FEEDBACK",
                timestamp,
                by: "customer",
              }),
              "timeline.feedbackAt": timestamp,
              updatedAt: timestamp,
            });

            const businessData = businessSnap.data();
            const existingSummary = businessData?.reviewSummary;

            const reviewSummary = existingSummary || {
              averageRating: 0,
              totalReviews: 0,
              totalRatingPoints: 0,
              stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            };

            const newTotalReviews = reviewSummary.totalReviews + 1;
            const newTotalRatingPoints =
              reviewSummary.totalRatingPoints + (rating ?? 0);

            const newSummary = {
              averageRating: (
                newTotalRatingPoints / newTotalReviews
              ).toFixed(1),
              totalReviews: newTotalReviews,
              totalRatingPoints: newTotalRatingPoints,
              stars: {
                ...reviewSummary.stars,
                [rating ?? 0]: (reviewSummary.stars?.[rating ?? 0] || 0) + 1,
              },
            };

            transaction.set(businessRef, { reviewSummary: newSummary }, { merge: true });
          });

          await clearTrackedOrderIfMatching(uid, orderId);

          return { data: null };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error("Error submitting order feedback:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["OrderTracking", "Restaurants"],
    }),

    clearTrackedOrder: builder.mutation<
      null,
      { uid?: string | null; orderId: string }
    >({
      async queryFn({ uid, orderId }) {
        try {
          if (!uid || !orderId) {
            throw new Error("Missing customer uid or order id");
          }

          await clearTrackedOrderIfMatching(uid, orderId);

          return { data: null };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error("Error while clearing tracked order:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["User"],
    }),

    finalizePendingLoyalty: builder.mutation<
      { skipped?: boolean; alreadyCounted?: boolean },
      { uid?: string | null; orderId?: string | null }
    >({
      async queryFn({ uid, orderId }) {
        try {
          if (!uid || !orderId) {
            throw new Error("Missing loyalty update parameters");
          }

          const customerRef = doc(db, "customers", uid);
          const customerSnap = await getDoc(customerRef);

          if (!customerSnap.exists()) {
            throw new Error("Customer document not found");
          }

          const customerData = customerSnap.data();
          const restaurants = Array.isArray(customerData?.restaurants)
            ? customerData.restaurants
            : [];
          const pendingLoyalty = customerData?.trackedOrder?.pendingLoyalty;
          const alreadyCounted =
            customerData?.trackedOrder?.loyaltyCountedForOrderId === orderId;

          if (!pendingLoyalty || pendingLoyalty.orderId !== orderId) {
            return { data: { skipped: true } };
          }

          const restaurantIndex = restaurants.findIndex(
            (restaurant: Record<string, unknown>) =>
              restaurant?.accessToken === pendingLoyalty.restaurant
          );

          if (!alreadyCounted) {
            const updatedRestaurants =
              restaurantIndex >= 0
                ? restaurants.map(
                    (
                      restaurant: Record<string, unknown>,
                      index: number
                    ) =>
                      index === restaurantIndex
                        ? {
                            ...restaurant,
                            totalAmount:
                              (Number(restaurant.totalAmount) || 0) +
                              (pendingLoyalty.amount || 0),
                            totalItems:
                              (Number(restaurant.totalItems) || 0) +
                              (pendingLoyalty.items || 0),
                            totalOrders:
                              (Number(restaurant.totalOrders) || 0) +
                              (pendingLoyalty.totalOrders || 1),
                            lastOrderTime: Date.now(),
                            firstOrderTime:
                              restaurant.firstOrderTime ||
                              pendingLoyalty.firstOrderTime ||
                              Date.now(),
                          }
                        : restaurant
                  )
                : [
                    ...restaurants,
                    {
                      accessToken: pendingLoyalty.restaurant,
                      totalAmount: pendingLoyalty.amount || 0,
                      totalItems: pendingLoyalty.items || 0,
                      totalOrders: pendingLoyalty.totalOrders || 1,
                      lastOrderTime: Date.now(),
                      firstOrderTime:
                        pendingLoyalty.firstOrderTime || Date.now(),
                    },
                  ];

            await updateDoc(customerRef, {
              restaurants: updatedRestaurants,
              "trackedOrder.loyaltyCountedForOrderId": orderId,
              "trackedOrder.pendingLoyalty": null,
            });
          }

          return { data: { alreadyCounted } };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error("Error finalizing pending loyalty:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useFetchBannersQuery,
  useFetchBusinessesQuery,
  useFetchMenuDataQuery,
  useFetchServicesQuery,
  useFetchOrderTrackingDataQuery,
  useFetchLastOrderQuery,
  useCancelOrderMutation,
  useSetOrderFeedbackMutation,
  useClearTrackedOrderMutation,
  useFinalizePendingLoyaltyMutation,
} = firestoreApi;

trackedOrderCacheReader.read = (arg, state) => {
  const result = firestoreApi.endpoints.fetchOrderTrackingData.select(arg)(
    state as never
  );
  return result?.data as Partial<OrderType> | undefined;
};
