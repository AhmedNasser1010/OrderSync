import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  writeBatch,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { canTransition, getTimelineField } from "@ordersync/order-utils";
import type { OrderType, OrderStatusType } from "@ordersync/types";
import randomOrderNumber from "@/utils/randomOrderId";
import { setRateIsOpen, setHasOrder } from "@/rtk/slices/toggleSlice";

interface TrackedOrderArg {
  orderId?: string | null;
  resId?: string | null;
  uid?: string | null;
}

export interface PlaceOrderInput {
  customerUid: string;
  business: {
    id: string;
    name: string;
    nameInAr: string;
    phone: string;
    address: string;
    latlng: number[];
  };
  assignment?: { driverUid?: string | null } | null;
  delivery: {
    address: string;
    latlng: number[];
    note?: string;
  };
  cart: {
    id: string;
    name: string;
    quantity: number;
    selectedSize?: string | null;
    discountCode?: string;
  }[];
  pricing: {
    subtotal: number;
    discount: number;
    deliveryFees: number;
    total: number;
    promoCode?: string;
    promoDiscount?: number;
  };
  payment: { method: string; status: string };
  finance?: Record<string, number>;
  reconciliation?: Record<string, unknown>;
  notes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  customer: {
    uid: string;
    name: string;
    phone: string;
    secondPhone?: string;
    firstOrderDate: number;
    totalOrders: number;
    totalOrdersValue: number;
  };
}

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
  tagTypes: ["OrderTracking", "User", "Restaurants", "Menu"],
  endpoints: (builder) => ({
    // =====================================================================
    // Query Endpoints
    // =====================================================================

    fetchBusinesses: builder.query<unknown[], void>({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        const businessesRef = collection(db, "businesses");

        await cacheDataLoaded;

        const unsubscribe = onSnapshot(
          businessesRef,
          (snapshot) => {
            updateCachedData((draft: unknown[]) => {
              draft.length = 0;
              snapshot.docs.forEach((doc) => {
                draft.push({ id: doc.id, ...doc.data() });
              });
            });
          },
          (error) => {
            console.error(
              "Error in real-time listener [fetchBusinesses]:",
              error?.message
            );
          }
        );

        await cacheEntryRemoved;
        unsubscribe();
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

    fetchOrderTrackingData: builder.query<Partial<OrderType> | null, TrackedOrderArg>({
      queryFn: () => ({ data: null }),
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
                if (draft) Object.assign(draft, data);
              });
              dispatch(setHasOrder(true));
              if (data.status?.current === "DELIVERED") {
                dispatch(setRateIsOpen(true));
              }
            } else {
              updateCachedData((draft) => {
                if (draft) Object.keys(draft).forEach((k) => delete draft[k as keyof typeof draft]);
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
      providesTags: ["OrderTracking"],
    }),

    // =====================================================================
    // Mutation Endpoints
    // =====================================================================

    setPlaceOrder: builder.mutation<null, PlaceOrderInput>({
      async queryFn(orderData) {
        try {
          if (!orderData) {
            throw new Error("Order data is required.");
          }

          const restaurantRef = doc(db, "businesses", orderData.business.id);
          const restaurantSnap = await getDoc(restaurantRef);

          if (!restaurantSnap.exists()) {
            throw new Error("Restaurant not found.");
          }

          const restaurantData = restaurantSnap.data();
          const restaurantStatus = restaurantData?.status || "pause";

          if (
            restaurantStatus === "inactive" ||
            restaurantStatus === "pause"
          ) {
            return {
              error: {
                code: "RESTAURANT_NOT_ACCEPTING_ORDERS",
                status: restaurantStatus,
                message:
                  "This restaurant is currently closed or paused right now.",
              },
            };
          }

          const customerRef = doc(db, "customers", orderData.customer.uid);

          const batch = writeBatch(db);

          const orderRef = doc(collection(db, "orders"));
          const now = Date.now();
          const orderNumber = randomOrderNumber();

          const pendingLoyalty = {
            orderId: orderRef.id,
            restaurant: orderData.business.id,
            amount: orderData.pricing.total,
            items: orderData.cart.reduce(
              (sum, item) => sum + (item.quantity || 0),
              0
            ),
            totalOrders: 1,
            firstOrderTime: orderData.customer.firstOrderDate,
            counted: false,
          };

          const newOrder = {
            ...orderData,
            id: orderRef.id,
            orderNumber,
            businessId: orderData.business.id,
            status: {
              current: "RECEIVED" as OrderStatusType,
              history: [
                { status: "RECEIVED" as OrderStatusType, timestamp: now, by: "customer" },
              ],
            },
            timeline: { placedAt: now },
            createdAt: now,
            updatedAt: now,
          };

          batch.set(orderRef, newOrder);
          batch.update(customerRef, {
            trackedOrder: {
              id: orderRef.id,
              orderNumber,
              restaurant: orderData.business.id,
              pendingLoyalty,
            },
          });

          await batch.commit();

          return { data: null };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error("Error while placing a new order:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["OrderTracking"],
    }),

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

          const customerRef = doc(db, "customers", uid);
          await updateDoc(customerRef, {
            "trackedOrder.id": null,
          });

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
          const userRef = doc(db, "customers", uid);
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

          await updateDoc(userRef, {
            "trackedOrder.id": null,
          });

          return { data: null };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error("Error submitting order feedback:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["OrderTracking"],
    }),

    setUserOrderIdToNull: builder.mutation<null, string | null | undefined>({
      async queryFn(uid) {
        try {
          if (!uid) {
            throw new Error("Missing customer uid");
          }

          const customerRef = doc(db, "customers", uid);

          await updateDoc(customerRef, {
            "trackedOrder.id": null,
          });

          return { data: null };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error("Error while set customer orderId to null:", message);
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
  useFetchBusinessesQuery,
  useFetchMenuDataQuery,
  useFetchOrderTrackingDataQuery,
  useSetPlaceOrderMutation,
  useCancelOrderMutation,
  useSetOrderFeedbackMutation,
  useSetUserOrderIdToNullMutation,
  useFinalizePendingLoyaltyMutation,
} = firestoreApi;
