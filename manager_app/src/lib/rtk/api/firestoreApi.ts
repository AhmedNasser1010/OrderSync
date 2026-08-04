import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import type { QueryConstraint } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  ManagerUser,
  MainMenuType,
  BusinessDocument,
} from "@ordersync/types";
import type { OrderType } from "@ordersync/types";

export const firestoreApi = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: ["User", "Menu", "Restaurant", "Orders"],
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
  }),
});

export const {
  useFetchUserDataQuery,
  useFetchMenuDataQuery,
  useFetchRestaurantDataQuery,
  useFetchOrdersDataQuery,
} = firestoreApi;
