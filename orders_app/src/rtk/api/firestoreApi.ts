import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  collection,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  runTransaction,
  writeBatch,
  arrayUnion,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { OrderType, OrderStatusType, RestaurantStatusTypes, BusinessDocument } from "@ordersync/types";
import type { DailyReport } from "@ordersync/types";
import { canTransition, canReverseTransition, getTimelineField } from "@ordersync/order-utils";
import { ordersForDateRange, getDailyReportRef } from "@ordersync/order-utils";

export const firestoreApi = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: ["User", "Orders", "Menu", "Restaurant", "DailyReports"],
  endpoints: (builder) => ({
    // =====================================================================
    // Query Endpoints
    // =====================================================================

    fetchUserData: builder.query({
      async queryFn(userUid) {
        try {
          const ref = doc(db, "users", userUid);
          const docSnapshot = await getDoc(ref);
          if (!docSnapshot.exists()) {
            return { error: "User not found" };
          }
          return { data: docSnapshot.data() };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["User"],
    }),

    fetchMenuData: builder.query({
      async queryFn(resId) {
        try {
          const menuRef = doc(db, "menus", resId);
          const menuSnapshot = await getDoc(menuRef);
          return { data: menuSnapshot.data() };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["Menu"],
    }),

    fetchRestaurantData: builder.query<BusinessDocument, string>({
      queryFn: () => ({ data: {} as BusinessDocument }),
      async onCacheEntryAdded(
        resId,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        if (!resId) return;

        const resRef = doc(db, "businesses", resId);

        await cacheDataLoaded;

        const unsubscribe = onSnapshot(
          resRef,
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              updateCachedData((draft) => {
                Object.assign(draft, docSnapshot.data());
              });
            }
          },
          (error) => {
            console.error("Error in real-time listener [fetchRestaurantData]:", error?.message);
          },
        );

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: ["Restaurant"],
    }),

    fetchActiveOrders: builder.query<OrderType[], string>({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(
        businessId,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef,
          where("businessId", "==", businessId),
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
            console.error("Error in real-time listener [fetchActiveOrders]:", error?.message);
          },
        );

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: ["Orders"],
    }),

    // =====================================================================
    // Mutation Endpoints — All use Firestore Transactions
    // =====================================================================

    setOrderStatus: builder.mutation({
      async queryFn({ orderId, updatedStatus }: { orderId: string; updatedStatus: OrderStatusType }) {
        try {
          if (!orderId) throw new Error("Order ID is required.");
          if (!updatedStatus) throw new Error("Target status is required.");

          const orderRef = doc(db, "orders", orderId);

          await runTransaction(db, async (transaction) => {
            const orderSnap = await transaction.get(orderRef);
            if (!orderSnap.exists()) {
              throw new Error(`Order not found: ${orderId}`);
            }

            const order = orderSnap.data() as OrderType;
            const currentStatus = order.status.current;

            if (!canTransition(currentStatus, updatedStatus) && !canReverseTransition(currentStatus, updatedStatus)) {
              throw new Error(
                `Invalid transition: ${currentStatus} -> ${updatedStatus}`,
              );
            }

            const now = Date.now();
            const timelineField = getTimelineField(updatedStatus);

            transaction.update(orderRef, {
              "status.current": updatedStatus,
              "status.history": arrayUnion({
                status: updatedStatus,
                timestamp: now,
                by: "manager",
              }),
              [`timeline.${timelineField}`]: now,
              updatedAt: now,
            });
          });

          return { data: null };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error("Error updating order status:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Orders"],
    }),

    setCancelOrder: builder.mutation({
      async queryFn({ orderId, reason }: { orderId: string; reason?: string }) {
        try {
          if (!orderId) throw new Error("Order ID is required.");

          const orderRef = doc(db, "orders", orderId);

          await runTransaction(db, async (transaction) => {
            const orderSnap = await transaction.get(orderRef);
            if (!orderSnap.exists()) {
              throw new Error(`Order not found: ${orderId}`);
            }

            const order = orderSnap.data() as OrderType;
            const currentStatus = order.status.current;

            if (!canTransition(currentStatus, "CANCELED")) {
              throw new Error(
                `Cannot cancel order in status: ${currentStatus}`,
              );
            }

            const now = Date.now();

            const updateData: Record<string, unknown> = {
              "status.current": "CANCELED",
              "status.history": arrayUnion({
                status: "CANCELED",
                timestamp: now,
                by: "manager",
              }),
              "timeline.canceledAt": now,
              updatedAt: now,
            };

            if (reason) {
              updateData["status.cancellationReason"] = reason;
            }

            transaction.update(orderRef, updateData);
          });

          return { data: null };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error("Error canceling order:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Orders"],
    }),

    setRestaurantStatus: builder.mutation({
      async queryFn({ resId, status }: { resId: string; status: RestaurantStatusTypes }) {
        try {
          if (!status) throw new Error("Status is required.");
          if (!resId) throw new Error("Restaurant ID is required.");

          await updateDoc(doc(db, "businesses", resId), { status });
          return { data: null };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error("Error updating restaurant status:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Restaurant"],
    }),

    setCloseDay: builder.mutation({
      async queryFn({ resId, summaryData }: { resId: string; summaryData: { date: string; [key: string]: unknown } }) {
        try {
          if (!resId) throw new Error("Restaurant ID is required.");
          if (!summaryData?.date) throw new Error("Summary data with date is required.");

          const dateStr = summaryData.date;
          const now = Date.now();

          const batch = writeBatch(db);

          // Write the daily report to the new top-level collection
          const reportRef = getDailyReportRef(db, resId, dateStr);
          const reportData: DailyReport = {
            businessId: resId,
            businessDate: dateStr,
            createdAt: now,
            totalOrders: (summaryData.totalOrders as number) || 0,
            totalRevenue: (summaryData.totalRevenue as number) || 0,
            totalDiscounts: (summaryData.totalDiscounts as number) || 0,
            totalDeliveryFees: (summaryData.totalDeliveryFees as number) || 0,
            itemsAnalytics: (summaryData.itemsAnalytics as DailyReport["itemsAnalytics"]) || [],
            categoriesAnalytics: (summaryData.categoriesAnalytics as DailyReport["categoriesAnalytics"]) || [],
            orderDurations: (summaryData.orderDurations as DailyReport["orderDurations"]) || {
              averagePreparationTime: 0,
              averageDeliveryTime: 0,
              averageCompletionTime: 0,
            },
            customerInsights: (summaryData.customerInsights as DailyReport["customerInsights"]) || {
              totalUniqueCustomers: 0,
              newCustomers: 0,
              returningCustomers: 0,
              averageRating: 0,
              feedbackCount: 0,
            },
            paymentMethods: (summaryData.paymentMethods as DailyReport["paymentMethods"]) || {},
            orderSources: (summaryData.orderSources as DailyReport["orderSources"]) || {},
            topLocations: (summaryData.topLocations as DailyReport["topLocations"]) || [],
            cancelledOrders: (summaryData.cancelledOrders as DailyReport["cancelledOrders"]) || {
              totalCancelled: 0,
              cancellationRate: 0,
            },
          };
          batch.set(reportRef, reportData);

          // Set restaurant status to inactive
          const businessRef = doc(db, "businesses", resId);
          batch.update(businessRef, { status: "inactive" });

          await batch.commit();

          console.log("Close day completed. Daily report saved, restaurant set to inactive.");
          return { data: null };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error("Error closing the day:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Restaurant", "DailyReports"],
    }),

    setDisplaySettings: builder.mutation({
      async queryFn({ resId, settingName, value }: { resId: string; settingName: string; value: string }) {
        try {
          if (!value) return { data: null };

          const validFields = ["promotionalSubtitle", "cover", "icon", "closeMsg"];
          if (validFields.includes(settingName)) {
            await updateDoc(doc(db, "businesses", resId), {
              [`branding.${settingName}`]: value,
            });
          }

          return { data: null };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error("Error updating display settings:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Restaurant"],
    }),

    setOrderWorkflowSettings: builder.mutation({
      async queryFn({ resId, settingName, value }: { resId: string; settingName: string; value: boolean }) {
        try {
          if (typeof value !== "boolean") return { data: null };

          await updateDoc(doc(db, "businesses", resId), {
            [`settings.${settingName}`]: value,
          });

          return { data: null };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error("Error updating workflow settings:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Restaurant"],
    }),
  }),
});

export const {
  useFetchUserDataQuery,
  useFetchActiveOrdersQuery,
  useFetchMenuDataQuery,
  useFetchRestaurantDataQuery,
  useSetOrderStatusMutation,
  useSetCancelOrderMutation,
  useSetRestaurantStatusMutation,
  useSetCloseDayMutation,
  useSetDisplaySettingsMutation,
  useSetOrderWorkflowSettingsMutation,
} = firestoreApi;
