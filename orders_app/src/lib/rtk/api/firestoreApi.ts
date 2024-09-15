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
import { Order } from "@/types/order";
import { RestaurantStatusTypes } from "@/types/restaurant";

const statusForward = {
  RECEIVED: "ON_GOING",
  ON_GOING: "IN_DELIVERY",
  IN_DELIVERY: "COMPLETED",
};

const statusBackward = {
  ON_GOING: "RECEIVED",
  IN_DELIVERY: "ON_GOING",
  COMPLETED: "IN_DELIVERY",
};

export const firestoreApi = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: ["User", "Orders", "Menu", "Restaurant"],
  endpoints: (builder) => ({

    // Query Endpoints
    fetchUserData: builder.query({
      async queryFn(userUid) {
        try {
          const ref = doc(db, "users", userUid);
          const docSnapshot = await getDoc(ref);
          console.log("Read Operation [fetchUserData]")
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

              console.log("Real-time update operation [fetchOpenOrdersData]");
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

    // Mutation Endpoints
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

          console.log("Write Operation [setOrderStatus]")
          return { data: null };
        } catch (error: any) {
          console.error("Error updating order status:", error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Orders"],
    }),
    setDeleteOrderStatus: builder.mutation({
      async queryFn({ orders, orderId, resId, cancellationReason }) {
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

          // Simulate an update
          const updatedOrders = orders.map((order: Order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: "CANCELED",
                  statusUpdatedSince: Date.now(),
                  cancellationReason
                }
              : order
          );

          // Perform Firestore update logic here
          const docRef = doc(db, "orders", resId);

          await updateDoc(docRef, {
            open: updatedOrders,
          });

          console.log("Write Operation [setDeleteOrderStatus]")
          return { data: null };
        } catch (error: any) {
          console.error("Error while order cancellation:", error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Orders"],
    }),
    setRestaurantStatus: builder.mutation({
      async queryFn({ resId, status }: { resId: string, status: RestaurantStatusTypes }) {
        try {
          // Validate input data
          if (!status) {
            throw new Error("Order ID is required.");
          }
          if (!resId) {
            throw new Error("Restaurant ID is required.");
          }

          // Perform Firestore update logic here
          const docRef = doc(db, "businesses", resId);

          await updateDoc(docRef, {
            ['settings.siteControl.status']: status,
          });

          console.log("Write Operation [setRestaurantStatus]")
          return { data: null };
        } catch (error: any) {
          console.error("Error updating restaurant status:", error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Restaurant"],
    }),

  }),
});

export const {
  useFetchUserDataQuery,
  useFetchOpenOrdersDataQuery,
  useFetchMenuDataQuery,
  useFetchRestaurantDataQuery,
  useSetOrderStatusMutation,
  useSetDeleteOrderStatusMutation,
  useSetRestaurantStatusMutation,
} = firestoreApi;
