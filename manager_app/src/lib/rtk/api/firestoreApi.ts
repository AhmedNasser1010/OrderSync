import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User, MenuData, MenuDocument } from "@/lib/types/types";
import { OrderType } from "@/../../types/order";
import { AnalyticsEntry } from "@/lib/types/AnalyticsEntry";

export const firestoreApi = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    "User",
    "Menu",
    "Restaurant",
    "CompletedOrders",
    "VoidedOrders",
    "OpenQueue",
    "HistoryOrders",
    "DailySummarizationOrders",
  ],
  endpoints: (builder) => ({
    // Query Endpoints
    fetchUserData: builder.query<User, string>({
      async queryFn(userUid) {
        try {
          const ref = doc(db, "users", userUid);
          const docSnapshot = await getDoc(ref);
          console.log("Read Operation [fetchUserData]");
          if (!docSnapshot.exists()) {
            return { error: "User not found" };
          }
          const userData = docSnapshot.data() as User;
          return { data: userData };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["User"],
    }),
    fetchMenuData: builder.query({
      async queryFn(resId) {
        try {
          const menuRef = doc(db, "menus", resId);
          const menuSnapshot = await getDoc(menuRef);
          const menu = menuSnapshot.data();
          console.log("Read Operation [fetchMenuData]");
          return { data: menu };
        } catch (error: any) {
          console.error(error?.message);
          return { error: error?.message };
        }
      },
      providesTags: ["Menu"],
    }),
    fetchRestaurantData: builder.query({
      async queryFn(resId) {
        try {
          const resRef = doc(db, "businesses", resId);
          const resSnapshot = await getDoc(resRef);
          const restaurant = resSnapshot.data();
          console.log("Read Operation [fetchRestaurantData]");
          return { data: restaurant };
        } catch (error: any) {
          console.error(error?.message);
          return { error: error?.message };
        }
      },
      providesTags: ["Restaurant"],
    }),
    fetchCompletedOrdersData: builder.query({
      async queryFn(resId) {
        try {
          const completedOrdersRef = collection(
            db,
            "orders",
            resId,
            "completedOrders",
          );
          const completedOrdersSnapshot = await getDocs(completedOrdersRef);
          const completedOrders = completedOrdersSnapshot.docs.map((doc) =>
            doc.data(),
          );
          console.log("Read Operation [completedOrders]");
          return { data: completedOrders };
        } catch (error: any) {
          console.error(error?.message);
          return { error: error?.message };
        }
      },
      providesTags: ["CompletedOrders"],
    }),
    fetchVoidedOrdersData: builder.query({
      async queryFn(resId) {
        try {
          const voidedOrdersRef = collection(
            db,
            "orders",
            resId,
            "voidedOrders",
          );
          const voidedOrdersSnapshot = await getDocs(voidedOrdersRef);
          const voidedOrders = voidedOrdersSnapshot.docs.map((doc) =>
            doc.data(),
          );
          console.log("Read Operation [voidedOrders]");
          return { data: voidedOrders };
        } catch (error: any) {
          console.error(error?.message);
          return { error: error?.message };
        }
      },
      providesTags: ["VoidedOrders"],
    }),
    fetchOpenOrdersData: builder.query({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(
        resId,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        const openQueueRef = collection(db, "orders", resId, "openQueue");

        await cacheDataLoaded;

        const unsubscribe = onSnapshot(
          openQueueRef,
          (snapshot) => {
            updateCachedData((draft: OrderType[]) => {
              draft.length = 0;
              snapshot.docs.forEach((doc) =>
                draft.push(doc.data() as OrderType),
              );
            });
            console.log("Real-time Update [openQueue]");
          },
          (error) => {
            console.error("Error in real-time listener:", error?.message);
          },
        );

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: ["OpenQueue"],
    }),
    fetchHistoryOrdersData: builder.query({
      async queryFn(resId) {
        try {
          const historyOrdersRef = collection(db, "orders", resId, "history");
          const historyOrdersSnapshot = await getDocs(historyOrdersRef);
          const historyOrders = historyOrdersSnapshot.docs.map((doc) =>
            doc.data(),
          );
          console.log("Read Operation [historyOrders]");
          return { data: historyOrders };
        } catch (error: any) {
          console.error(error?.message);
          return { error: error?.message };
        }
      },
      providesTags: ["HistoryOrders"],
    }),
    fetchOrdersDailySummarizationData: builder.query<AnalyticsEntry[], string>({
      async queryFn(
        resId,
      ): Promise<{ data: AnalyticsEntry[] } | { error: string }> {
        try {
          const dailySummarizationRef = collection(
            db,
            "orders",
            resId,
            "dailySummarization",
          );
          const dailySummarizationSnapshot = await getDocs(
            dailySummarizationRef,
          );
          const dailySummarization = dailySummarizationSnapshot.docs.map(
            (d) => d.data() as AnalyticsEntry,
          );
          console.log("Read Operation [dailySummarizationOrders]");
          return { data: dailySummarization };
        } catch (error: any) {
          console.error(error);
          console.error(error?.stack);
          return { error: error?.message };
        }
      },
      providesTags: ["DailySummarizationOrders"],
    }),

    syncMenuData: builder.mutation<
      { synced: true },
      { resId: string; menu: MenuDocument }
    >({
      async queryFn({ resId, menu }) {
        try {
          const batch = writeBatch(db);
          const menuRef = doc(db, "menus", resId);
          batch.set(menuRef, menu);
          await batch.commit();
          console.log("Write Operation [syncMenuData]");
          return { data: { synced: true } };
        } catch (error: any) {
          console.error(error?.message);
          return { error: error?.message };
        }
      },
      invalidatesTags: ["Menu"],
    }),
  }),
});

export const {
  useFetchUserDataQuery,
  useFetchOpenOrdersDataQuery,
  useFetchMenuDataQuery,
  useFetchRestaurantDataQuery,
  useFetchCompletedOrdersDataQuery,
  useFetchVoidedOrdersDataQuery,
  useFetchHistoryOrdersDataQuery,
  useFetchOrdersDailySummarizationDataQuery,
  useSyncMenuDataMutation,
} = firestoreApi;
