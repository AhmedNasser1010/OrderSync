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
import type { QueryConstraint } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  ManagerUser,
  MainMenuType,
  BusinessDocument,
  PromoCode,
} from "@ordersync/types";
import type { OrderType } from "@ordersync/types";

export const firestoreApi = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: ["User", "Menu", "Restaurant", "Orders", "PromoCodes"],
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

    // Orders for this business from global collection, filtered by time range
    fetchOrdersData: builder.query<
      OrderType[],
      { resId: string; start: number | null; end: number | null }
    >({
      async queryFn({ resId, start, end }) {
        try {
          if (!resId) return { error: "Restaurant ID is required." };

          const ordersRef = collection(db, "orders");
          const constraints: QueryConstraint[] = [
            where("businessId", "==", resId),
          ];
          if (start != null) constraints.push(where("createdAt", ">=", start));
          if (end != null) constraints.push(where("createdAt", "<", end));
          constraints.push(orderBy("createdAt", "desc"));

          const ordersSnapshot = await getDocs(query(ordersRef, ...constraints));
          const orders = ordersSnapshot.docs.map(
            (d) => d.data() as OrderType,
          );
          console.log("Read Operation [orders]");
          return { data: orders };
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["Orders"],
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
  useSyncMenuDataMutation,
  useFetchPromoCodesQuery,
  useAddPromoCodeMutation,
  useUpdatePromoCodeMutation,
  useDeletePromoCodeMutation,
} = firestoreApi;
