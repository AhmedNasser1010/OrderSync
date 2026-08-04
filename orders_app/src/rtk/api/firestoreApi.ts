import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  collection,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  runTransaction,
  arrayUnion,
  query,
  where,
  deleteField,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { OrderType, OrderStatusType, RestaurantStatusTypes, BusinessDocument } from "@ordersync/types";
import { canTransition, canReverseTransition, getTimelineField, isDriverOwned } from "@ordersync/order-utils";

export const firestoreApi = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: ["User", "Orders", "Menu", "Restaurant"],
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

            if (isDriverOwned(order)) {
              throw new Error(
                `Order is claimed by a driver and cannot be updated from the orders app`,
              );
            }

            if (updatedStatus === "VOIDED") {
              throw new Error("Voiding orders is not supported in the orders app");
            }

            const businessRef = doc(db, "businesses", order.businessId);
            const businessSnap = await transaction.get(businessRef);
            const skipAccepted =
              businessSnap.exists() &&
              (businessSnap.data() as BusinessDocument).settings?.skipAccepted === true;

            const isSkipAcceptedReverse =
              skipAccepted && currentStatus === "PREPARING" && updatedStatus === "RECEIVED";

            if (
              !canTransition(currentStatus, updatedStatus) &&
              !canReverseTransition(currentStatus, updatedStatus) &&
              !isSkipAcceptedReverse
            ) {
              throw new Error(
                `Invalid transition: ${currentStatus} -> ${updatedStatus}`,
              );
            }

            const now = Date.now();
            const isReverse = canReverseTransition(currentStatus, updatedStatus) || isSkipAcceptedReverse;

            const updateData: Record<string, unknown> = {
              "status.current": updatedStatus,
              "status.history": arrayUnion({
                status: updatedStatus,
                timestamp: now,
                by: "manager",
              }),
              updatedAt: now,
            };

            if (!isReverse) {
              const timelineField = getTimelineField(updatedStatus);
              updateData[`timeline.${timelineField}`] = now;
            }

            transaction.update(orderRef, updateData);
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
      async queryFn({
        orderId,
        reason,
        status = "CANCELED",
      }: {
        orderId: string;
        reason?: string;
        status?: "CANCELED" | "REJECTED";
      }) {
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

            if (isDriverOwned(order)) {
              throw new Error(
                `Order is claimed by a driver and cannot be ${status === "REJECTED" ? "rejected" : "canceled"} from the orders app`,
              );
            }

            if (!canTransition(currentStatus, status)) {
              throw new Error(
                `Cannot ${status === "REJECTED" ? "reject" : "cancel"} order in status: ${currentStatus}`,
              );
            }

            if (status === "CANCELED" && currentStatus !== "ACCEPTED" && currentStatus !== "PREPARING") {
              throw new Error(
                `Order in status ${currentStatus} can only be rejected, not canceled`,
              );
            }

            if (status === "REJECTED" && currentStatus !== "RECEIVED") {
              throw new Error(
                `Order in status ${currentStatus} cannot be rejected`,
              );
            }

            const now = Date.now();

            const updateData: Record<string, unknown> = {
              "status.current": status,
              "status.history": arrayUnion({
                status,
                timestamp: now,
                by: "manager",
              }),
              [`timeline.${getTimelineField(status)}`]: now,
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
          console.error(`Error ${status === "REJECTED" ? "rejecting" : "canceling"} order:`, message);
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

    setOpenNow: builder.mutation({
      async queryFn({ resId, openNowUntil }: { resId: string; openNowUntil: number }) {
        try {
          if (!resId) throw new Error("Restaurant ID is required.");
          if (!openNowUntil || openNowUntil <= Date.now()) {
            throw new Error("Invalid open-now window.");
          }

          await updateDoc(doc(db, "businesses", resId), {
            "operations.openNowUntil": openNowUntil,
            status: "active",
          });
          return { data: null };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error("Error opening restaurant now:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Restaurant"],
    }),

    setCloseDay: builder.mutation({
      async queryFn({ resId }: { resId: string }) {
        try {
          if (!resId) throw new Error("Restaurant ID is required.");

          await updateDoc(doc(db, "businesses", resId), {
            status: "inactive",
            "operations.openNowUntil": deleteField(),
          });

          console.log("Close day completed. Restaurant set to inactive.");
          return { data: null };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error("Error closing the day:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Restaurant"],
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
  useSetOpenNowMutation,
  useSetCloseDayMutation,
  useSetDisplaySettingsMutation,
  useSetOrderWorkflowSettingsMutation,
} = firestoreApi;
