import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  onSnapshot,
  writeBatch,
  query,
  where,
  orderBy,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  ManagerUser,
  MainMenuType,
  BusinessDocument,
  DailyReport,
  PromoCode,
} from "@ordersync/types";
import type { OrderType } from "@ordersync/types";

export const firestoreApi = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    "User",
    "Menu",
    "Restaurant",
    "Orders",
    "DailyReports",
    "PromoCodes",
  ],
  endpoints: (builder) => ({
    // Query Endpoints
    fetchUserData: builder.query<ManagerUser, string>({
      async queryFn(userUid) {
        try {
          const ref = doc(db, "users", userUid);
          const docSnapshot = await getDoc(ref);
          console.log("Read Operation [fetchUserData]");
          if (!docSnapshot.exists()) {
            return { error: "User not found" };
          }
          const userData = docSnapshot.data() as ManagerUser;
          return { data: userData };
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["User"],
    }),

    fetchMenuData: builder.query<MainMenuType | undefined, string>({
      async queryFn(resId) {
        try {
          const menuRef = doc(db, "menus", resId);
          const menuSnapshot = await getDoc(menuRef);
          const menu = menuSnapshot.data() as MainMenuType | undefined;
          console.log("Read Operation [fetchMenuData]");
          return { data: menu };
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["Menu"],
    }),

    fetchRestaurantData: builder.query<BusinessDocument | undefined, string>({
      queryFn: () => ({ data: {} as BusinessDocument }),
      async onCacheEntryAdded(
        resId,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        const resRef = doc(db, "businesses", resId);

        await cacheDataLoaded;

        const unsubscribe = onSnapshot(
          resRef,
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              updateCachedData((draft) => {
                if (draft) Object.assign(draft, docSnapshot.data());
              });
              console.log("Real-time Update [fetchRestaurantData]");
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

    // Real-time orders for this business from global collection
    fetchOrdersData: builder.query({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(
        resId,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef,
          where("businessId", "==", resId),
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
            console.log("Real-time Update [orders]");
          },
          (error) => {
            console.error("Error in real-time listener [orders]:", error?.message);
          },
        );

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: ["Orders"],
    }),

    // Daily reports from the top-level collection
    fetchDailyReportsData: builder.query<DailyReport[], string>({
      async queryFn(resId) {
        try {
          const dailyReportsRef = collection(db, "dailyReports");
          const q = query(
            dailyReportsRef,
            where("businessId", "==", resId),
            orderBy("businessDate", "desc"),
          );
          const dailyReportsSnapshot = await getDocs(q);
          const dailyReports = dailyReportsSnapshot.docs.map(
            (d) => d.data() as DailyReport,
          );
          console.log("Read Operation [dailyReports]");
          return { data: dailyReports };
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error(error);
          console.error(error instanceof Error ? error.stack : undefined);
          return { error: message };
        }
      },
      providesTags: ["DailyReports"],
    }),

    syncMenuData: builder.mutation<
      { synced: true },
      { resId: string; menu: MainMenuType }
    >({
      async queryFn({ resId, menu }) {
        try {
          const batch = writeBatch(db);
          const menuRef = doc(db, "menus", resId);
          batch.set(menuRef, menu);
          await batch.commit();
          console.log("Write Operation [syncMenuData]");
          return { data: { synced: true } };
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error(message);
          return { error: message };
        }
      },
      invalidatesTags: ["Menu"],
    }),

    fetchPromoCodes: builder.query<PromoCode[], string>({
      async queryFn(resId) {
        try {
          const promoCodesRef = collection(db, "promoCodes");
          const q = query(
            promoCodesRef,
            where("restaurantId", "==", resId),
          );
          const snapshot = await getDocs(q);
          const promoCodes = snapshot.docs.map((d) => d.data() as PromoCode);
          console.log("Read Operation [fetchPromoCodes]");
          return { data: promoCodes };
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["PromoCodes"],
    }),

    addPromoCode: builder.mutation<{ synced: true }, PromoCode>({
      async queryFn(promoCode) {
        try {
          const ref = doc(db, "promoCodes", promoCode.id);
          await setDoc(ref, promoCode);
          console.log("Write Operation [addPromoCode]");
          return { data: { synced: true } };
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error(message);
          return { error: message };
        }
      },
      invalidatesTags: ["PromoCodes"],
    }),

    updatePromoCode: builder.mutation<
      { synced: true },
      { id: string; updates: Partial<PromoCode> }
    >({
      async queryFn({ id, updates }) {
        try {
          const ref = doc(db, "promoCodes", id);
          await setDoc(ref, updates, { merge: true });
          console.log("Write Operation [updatePromoCode]");
          return { data: { synced: true } };
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error(message);
          return { error: message };
        }
      },
      invalidatesTags: ["PromoCodes"],
    }),

    deletePromoCode: builder.mutation<{ synced: true }, string>({
      async queryFn(id) {
        try {
          const ref = doc(db, "promoCodes", id);
          await deleteDoc(ref);
          console.log("Write Operation [deletePromoCode]");
          return { data: { synced: true } };
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error(message);
          return { error: message };
        }
      },
      invalidatesTags: ["PromoCodes"],
    }),
  }),
});

export const {
  useFetchUserDataQuery,
  useFetchMenuDataQuery,
  useFetchRestaurantDataQuery,
  useFetchOrdersDataQuery,
  useFetchDailyReportsDataQuery,
  useSyncMenuDataMutation,
  useFetchPromoCodesQuery,
  useAddPromoCodeMutation,
  useUpdatePromoCodeMutation,
  useDeletePromoCodeMutation,
} = firestoreApi;
