import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  arrayUnion,
  collection,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ordersApi } from "./ordersApi";
import { RootState } from "@/lib/rtk/store";
import { Order } from "@/types/order";

// data,
// isLoading,
// isSuccess,
// isError,
// error,

type StatusForward = { RECEIVED: "ON_GOING"; ON_GOING: "COMPLETED" };
type StatusBackward = { ON_GOING: "RECEIVED"; COMPLETED: "ON_GOING" };

const statusForward: StatusForward = {
  RECEIVED: "ON_GOING",
  ON_GOING: "COMPLETED",
};

const statusBackward: StatusBackward = {
  ON_GOING: "RECEIVED",
  COMPLETED: "ON_GOING",
};

export const firestoreApi = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: ["User", "Orders", "Menu"],
  endpoints: (builder) => ({
    fetchUserData: builder.query({
      async queryFn(userUid) {
        try {
          const ref = doc(db, "users", userUid);
          const docSnapshot = await getDoc(ref);
          console.log("Read Operation userApi.ts 22:37");
          if (!docSnapshot.exists()) {
            return { error: "User not found" };
          }
          const userData = docSnapshot.data();
          return { data: userData };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["User"],
    }),
    fetchOpenOrdersData: builder.query({
      async queryFn(resId, { dispatch }) {
        try {
          const openOrdersRef = doc(db, "orders", resId);

          // Set up Firestore onSnapshot listener for real-time updates
          const unsubscribe = onSnapshot(
            openOrdersRef,
            (openOrdersSnapshot) => {
              const openOrders = openOrdersSnapshot.data()?.open;

              // Dispatch data to Redux store for live updates
              dispatch(
                ordersApi.util.updateQueryData(
                  "fetchOpenOrdersData",
                  resId,
                  (draft) => {
                    return openOrders;
                  }
                )
              );

              console.log("Real-time update operation ordersApi.ts");
            }
          );

          // Return empty result as data is handled by onSnapshot
          return { data: [] };
        } catch (error: any) {
          console.error(error?.message);
          return { error: error?.message };
        }
      },
      providesTags: ["Orders"],
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
    setOrderStatus: builder.mutation({
      async queryFn({ orders, orderId, resId, direction }) {
        try {
          // Validate input data
          if (!orders || orders.length === 0) {
            throw new Error("Orders array is empty");
          }
          if (!orderId) {
            throw new Error("Order ID is required.");
          }
          if (!resId) {
            throw new Error("Restaurant ID is required.");
          }

          // Find the specific order that needs status change
          const orderToUpdate = orders.find(
            (order: Order) => order.id === orderId
          );
          if (!orderToUpdate) {
            throw new Error(`Cannot find order with id "${orderId}"`);
          }

          // Update the order status based on the direction
          const updatedStatus =
            direction === "forward"
              ? statusForward[
                  orderToUpdate.status as keyof typeof statusForward
                ]
              : statusBackward[
                  orderToUpdate.status as keyof typeof statusBackward
                ];

          // Simulate an update
          const updatedOrders = orders.map((order: Order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: updatedStatus,
                  statusUpdatedSince: Date.now(),
                  accepted: true,
                }
              : order
          );

          // Perform Firestore update logic here
          const docRef = doc(db, "orders", resId);

          await updateDoc(docRef, {
            open: updatedOrders,
          });

          return { data: null };
        } catch (error: any) {
          console.error("Error updating order status:", error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Orders"],
    }),
    // setOrderStatus: builder.mutation({
    //   async queryFn({ orderId, resId, direction }, { getState }) {
    //     try {
    //       const state = getState() as RootState;
    //       const openOrders = ordersApi.endpoints.fetchOpenOrdersData.select()(state);
    //       console.log('openOrders', openOrders) // { "status": "uninitialized", "isUninitialized": true, "isLoading": false, "isSuccess": false, "isError": false }
    //       return { data: null };
    //     } catch (error: any) {
    //       console.error(error.message);
    //       return { error: error.message };
    //     }
    //   },
    //   invalidatesTags: ['Orders'],
    // }),
  }),
});

export const {
  useFetchUserDataQuery,
  useFetchOpenOrdersDataQuery,
  useFetchMenuDataQuery,
  useSetOrderStatusMutation,
} = firestoreApi;
