import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  collection,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  onSnapshot,
  writeBatch,
  query,
  where,
  CollectionReference,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { OrderType, OrderStatusType } from "@/types/order";
import { Driver } from "@/types/driver";
import { RestaurantStatusTypes } from "@/types/restaurant";

// const statusForward = {
//   RECEIVED: "PREPARING",
//   PREPARING: "PICK_UP",
//   PICK_UP: "DELIVERED",
//   ON_ROUTE: "DELIVERED",
// };

// const statusBackward = {
//   PREPARING: "RECEIVED",
//   PICK_UP: "PREPARING",
//   ON_ROUTE: "PREPARING",
// };

export const firestoreApi = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    "User",
    "Orders",
    "Menu",
    "Restaurant",
    "CompletedOrders",
    "VoidedOrders",
    "OpenQueue",
    "HistoryOrders",
    "DailySummarizationOrders",
    "Drivers",
  ],
  endpoints: (builder) => ({
    // Query Endpoints
    fetchUserData: builder.query({
      async queryFn(userUid) {
        try {
          const ref = doc(db, "users", userUid);
          const docSnapshot = await getDoc(ref);
          console.log("Read Operation [fetchUserData]");
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
          const completedOrders = completedOrdersSnapshot.docs.map(
            (doc) => doc.data() as OrderType,
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
    fetchOpenOrdersData: builder.query<OrderType[], string>({
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
      }
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
    fetchOrdersDailySummarizationData: builder.query({
      async queryFn(resId) {
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
            (doc) => doc.data(),
          );
          console.log("Read Operation [dailySummarizationOrders]");
          return { data: dailySummarization };
        } catch (error: any) {
          console.error(error?.message);
          return { error: error?.message };
        }
      },
      providesTags: ["DailySummarizationOrders"],
    }),
    fetchDriversData: builder.query({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(
        accessToken,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        const driversRef = collection(db, "drivers");

        const q = query(
          driversRef,
          where("accessToken", "==", accessToken),
          where("sync", "==", "LOCAL"),
        );

        await cacheDataLoaded;

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            updateCachedData((draft: Driver[]) => {
              draft.length = 0;
              snapshot.docs.forEach((doc) => draft.push(doc.data() as Driver));
            });
            console.log("Real-time Update [fetchDriversData]");
          },
          (error) => {
            console.error(
              "Error in real-time listener [fetchDriversData]:",
              error?.message,
            );
          },
        );

        await cacheEntryRemoved;
        unsubscribe();
      }
    }),

    // Mutation Endpoints
    setOrderStatus: builder.mutation({
      async queryFn({ orderToUpdate, orderId, resId, updatedStatus }) {
        try {
          // Validate input data
          if (!orderToUpdate) {
            throw new Error("Order to update not found");
          }
          if (!orderId) {
            throw new Error("Order ID is required.");
          }
          if (!resId) {
            throw new Error("Restaurant ID is required.");
          }

          const getStatusTimestampKey = (status: OrderStatusType) => {
            switch (status) {
              case "RECEIVED":
                return "placedAt";
              case "PREPARING":
                return "preparedAt";
              case "PICK_UP":
                return "pickUpAt";
              case "DELIVERED":
                return "deliveredAt";
              case "CANCELED":
                return "canceledAt";
              case "REJECTED":
                return "rejectedAt";
              default:
                return "unknown";
            }
          };

          const timestampKeyName = getStatusTimestampKey(
            updatedStatus as OrderStatusType,
          );

          // Prepare the updated order with status change
          const updatedOrder = {
            ...orderToUpdate,
            status: {
              ...orderToUpdate.status,
              current: updatedStatus,
              accepted: true,
              history: [
                ...orderToUpdate.status.history,
                { status: updatedStatus, timestamp: Date.now() },
              ],
            },
            orderTimestamps: {
              ...orderToUpdate.orderTimestamps,
              [timestampKeyName]: Date.now(),
            },
            delivery: {
              ...orderToUpdate.delivery,
              uid:
                updatedStatus === "PREPARING" &&
                (orderToUpdate.status.current === "PICK_UP" ||
                  orderToUpdate.status.current === "ON_ROUTE")
                  ? null
                  : orderToUpdate.delivery.uid,
            },
          };

          // Firestore references for batch operation
          const openQueueRef = collection(db, "orders", resId, "openQueue");
          const completedOrdersRef = collection(
            db,
            "orders",
            resId,
            "completedOrders",
          );

          // Batch to perform both update and move operations atomically
          const batch = writeBatch(db);

          if (updatedStatus === "DELIVERED") {
            // Remove the completed order from `openQueue`
            const openOrderDocRef = doc(
              openQueueRef,
              `${orderId}_${orderToUpdate.customer.uid}`,
            );
            batch.delete(openOrderDocRef);

            // Add the completed order to `completedOrders`
            const completedOrderDocRef = doc(
              completedOrdersRef,
              `${orderId}_${orderToUpdate.customer.uid}`,
            );
            batch.set(completedOrderDocRef, updatedOrder);
          } else {
            // If status is not completed, just update the open queue
            const openOrderDocRef = doc(
              openQueueRef,
              `${orderId}_${orderToUpdate.customer.uid}`,
            );
            batch.set(openOrderDocRef, updatedOrder);
          }

          // Commit the batch
          await batch.commit();

          console.log(
            "Order status updated and moved to 'completedOrders' if completed",
          );
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

          // Find the specific order to cancel
          const orderToUpdate = orders.find(
            (order: OrderType) => order.id === orderId,
          );
          if (!orderToUpdate) {
            throw new Error(`Cannot find order with id "${orderId}"`);
          }

          // Create a new canceled order object with updated status
          const canceledOrder = {
            ...orderToUpdate,
            status: {
              ...orderToUpdate.status,
              current: "CANCELED",
              cancellationReason,
              accepted: true,
              history: [
                ...orderToUpdate.status.history,
                { status: "CANCELED", timestamp: Date.now() },
              ],
            },
            orderTimestamps: {
              ...orderToUpdate.orderTimestamps,
              canceledAt: Date.now(),
            },
          };

          // References to Firestore collections
          const openQueueRef = collection(db, "orders", resId, "openQueue");
          const voidedOrdersRef = collection(
            db,
            "orders",
            resId,
            "voidedOrders",
          );

          // Batch write to ensure atomicity
          const batch = writeBatch(db);

          // Remove the canceled order from `openQueue`
          const openOrderDocRef = doc(
            openQueueRef,
            `${orderId}_${orderToUpdate.customer.uid}`,
          );
          batch.delete(openOrderDocRef);

          // Add the canceled order to `voidedOrders`
          const voidedOrderDocRef = doc(
            voidedOrdersRef,
            `${orderId}_${orderToUpdate.customer.uid}`,
          );
          batch.set(voidedOrderDocRef, canceledOrder);

          // Commit the batch operation
          await batch.commit();

          console.log("Order canceled and moved to 'voidedOrders'");
          return { data: null };
        } catch (error: any) {
          console.error("Error while canceling order:", error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Orders"],
    }),
    setRestaurantStatus: builder.mutation({
      async queryFn({
        resId,
        status,
      }: {
        resId: string;
        status: RestaurantStatusTypes;
      }) {
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
            ["settings.siteControl.status"]: status,
          });

          console.log("Write Operation [setRestaurantStatus]");
          return { data: null };
        } catch (error: any) {
          console.error("Error updating restaurant status:", error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Restaurant"],
    }),
    setCloseDay: builder.mutation({
      async queryFn({ resId, orders, summaryData }) {
        try {
          // Actions
          // 1- Delete voided orders docs
          // 2- Delete completed orders docs
          // 3- Add current orders to history
          // 4- Add daily summarization
          // 5- Set restaurant status to inactive

          const date = summaryData.date;
          const historyRef = collection(db, "orders", resId, "history");
          const dailySummarizationRef = collection(
            db,
            "orders",
            resId,
            "dailySummarization",
          );

          const batch = writeBatch(db);

          const voidedOrdersRef = collection(
            db,
            "orders",
            resId,
            "voidedOrders",
          );
          const completedOrdersRef = collection(
            db,
            "orders",
            resId,
            "completedOrders",
          );

          const deleteCollectionDocs = async (
            collectionRef: CollectionReference,
          ) => {
            const q = query(collectionRef);
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              batch.delete(doc.ref);
            });
          };

          await deleteCollectionDocs(voidedOrdersRef);
          await deleteCollectionDocs(completedOrdersRef);

          orders.forEach((order: OrderType, index: number) => {
            const orderDocRef = doc(historyRef, `${date}_${index}`);
            batch.set(orderDocRef, order);
          });

          const dailySummarizationDocRef = doc(dailySummarizationRef, date);
          batch.set(dailySummarizationDocRef, summaryData);

          const docRef = doc(db, "businesses", resId);
          batch.update(docRef, {
            ["settings.siteControl.status"]: "inactive",
          });

          await batch.commit();

          console.log(
            "Close day data saved and old orders deleted successfully",
          );
          return { data: null };
        } catch (error: any) {
          console.error("Error while close the day:", error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: [
        "HistoryOrders",
        "DailySummarizationOrders",
        "Restaurant",
      ],
    }),
    setDisplaySettings: builder.mutation({
      async queryFn({
        resId,
        settingName,
        value,
      }: {
        resId: string;
        settingName: string;
        value: string;
      }) {
        try {
          if (!value) {
            return { data: null };
          }

          const docRef = doc(db, "businesses", resId);

          if (
            settingName === "promotionalSubtitle" ||
            settingName === "cover" ||
            settingName === "icon"
          ) {
            await updateDoc(docRef, {
              [`business.${settingName}`]: value,
            });
          } else if (settingName === "closeMsg") {
            await updateDoc(docRef, {
              ["settings.siteControl.closeMsg"]: value,
            });
          }

          console.log("Write Operation [setDisplaySettings]");
          return { data: null };
        } catch (error: any) {
          console.error(
            "Error updating restaurant display settings:",
            error.message,
          );
          return { error: error.message };
        }
      },
      invalidatesTags: ["Restaurant"],
    }),
    setOrderWorkflowSettings: builder.mutation({
      async queryFn({
        resId,
        settingName,
        value,
      }: {
        resId: string;
        settingName: string;
        value: string | boolean;
      }) {
        try {
          if (typeof value !== "boolean") {
            return { data: null };
          }

          const docRef = doc(db, "businesses", resId);

          await updateDoc(docRef, {
            [`settings.orderManagement.${settingName}`]: value,
          });

          console.log("Write Operation [setOrderWorkflowSettings]");
          return { data: null };
        } catch (error: any) {
          console.error(
            "Error updating restaurant order work flow settings:",
            error.message,
          );
          return { error: error.message };
        }
      },
      invalidatesTags: ["Restaurant"],
    }),
    assignOrderToDriver: builder.mutation({
      async queryFn({
        orders,
        orderId,
        resId,
        driverData,
      }: {
        orders: OrderType[];
        orderId: string;
        resId: string;
        driverData: Driver;
      }) {
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
          if (!driverData) {
            throw new Error("Driver ID is required.");
          }

          // Find the specific order to update
          const orderToUpdate = orders.find(
            (order: OrderType) => order.id === orderId,
          );
          if (!orderToUpdate) {
            throw new Error(`Cannot find order with id "${orderId}"`);
          }

          // Update the order fields
          const updatedOrder = {
            ...orderToUpdate,
            delivery: {
              ...orderToUpdate.delivery,
              uid: driverData.uid,
              name: driverData.userInfo.name,
              phone: driverData.userInfo.phone,
            },
            status: {
              ...orderToUpdate.status,
              current: "ON_ROUTE",
              history: [
                ...orderToUpdate.status.history,
                { status: "ON_ROUTE", timestamp: Date.now() },
              ],
            },
            orderTimestamps: {
              ...orderToUpdate.orderTimestamps,
              onRouteAt: Date.now(),
            },
          };

          // Firestore references for updating the order
          const openQueueRef = collection(db, "orders", resId, "openQueue");
          const openOrderDocRef = doc(
            openQueueRef,
            `${orderId}_${orderToUpdate.customer.uid}`,
          );

          // Update the order in Firestore
          const batch = writeBatch(db);
          batch.set(openOrderDocRef, updatedOrder);

          // Commit the batch
          await batch.commit();

          console.log("Order assigned to driver and status updated.");
          return { data: null };
        } catch (error: any) {
          console.error("Error assigning order to driver:", error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Orders"],
    }),
    setDriverDues: builder.mutation({
      async queryFn({
        driverId,
        duesValue,
      }: {
        driverId: string;
        duesValue: number;
      }) {
        try {
          if (!driverId) {
            throw new Error("Driver ID is required.");
          }

          const driverRef = doc(db, "drivers", driverId);

          const batch = writeBatch(db);

          batch.update(driverRef, {
            ["ordersDues"]: duesValue ? increment(-duesValue) : 0,
          });

          await batch.commit();

          console.log("Driver dues has been rested");
          return { data: null };
        } catch (error: any) {
          console.error("Error assigning order to driver:", error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Drivers"],
    }),
    setDriverStatus: builder.mutation({
      async queryFn({
        driverId,
        status,
      }: {
        driverId: string;
        status: boolean;
      }) {
        try {
          const driverRef = doc(db, "drivers", driverId);

          const batch = writeBatch(db);

          batch.update(driverRef, {
            ["online.byManager"]: status,
          });

          await batch.commit();

          console.log("Driver status has been updated");
          return { data: null };
        } catch (error: any) {
          console.error("Error set status to driver:", error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Drivers"],
    }),
    deleteDriver: builder.mutation({
      async queryFn(driverId: string) {
        try {
          const driverRef = doc(db, "drivers", driverId);

          const batch = writeBatch(db);

          batch.delete(driverRef);

          await batch.commit();

          return { data: null };
        } catch (error: any) {
          console.error("Error delete driver:", error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Drivers"],
    }),
    setNewDriver: builder.mutation({
      async queryFn({
        partnerUid,
        accessToken,
        email,
        name,
        phone,
        uid,
      }: {
        partnerUid: string;
        accessToken: string;
        email: string;
        name: string;
        phone: string;
        uid: string;
      }) {
        try {
          const driverRef = doc(db, "drivers", uid);

          const batch = writeBatch(db);

          batch.set(driverRef, {
            accessToken,
            partnerUid,
            joinDate: Date.now(),
            trackingFeature: true,
            ordersDues: 0,
            online: {
              byManager: true,
              byUser: false,
            },
            liveLocation: [0, 0],
            queue: [],
            sync: "LOCAL",
            uid,
            userInfo: {
              email,
              name,
              phone,
              role: "DRIVER",
            },
          });

          await batch.commit();

          return { data: null };
        } catch (error: any) {
          console.error("Error while added nre driver: ", error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Drivers"],
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
  useFetchDriversDataQuery,

  useSetOrderStatusMutation,
  useSetDeleteOrderStatusMutation,
  useSetRestaurantStatusMutation,
  useSetCloseDayMutation,
  useSetDisplaySettingsMutation,
  useSetOrderWorkflowSettingsMutation,
  useAssignOrderToDriverMutation,
  useSetDriverDuesMutation,
  useSetDriverStatusMutation,
  useDeleteDriverMutation,
  useSetNewDriverMutation,
} = firestoreApi;
