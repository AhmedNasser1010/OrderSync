import { db } from "@/lib/firebase";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type { Driver, OrderType, OrderStatusType } from "@ordersync/types";

export const firestoreApi = createApi({
  reducerPath: "firestoreApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["UserData", "DriverProfile", "PickUpOrders", "OrderStatus"],
  endpoints: (builder) => ({
    fetchUserData: builder.query<
      Pick<Driver, "userInfo" | "online">,
      { uid: string }
    >({
      queryFn: (user) => {
        if (!user?.uid) {
          return { error: { message: "No user", data: "" } };
        }
        return new Promise((resolve) => {
          const unsub = onSnapshot(
            doc(db, "drivers", user.uid),
            (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data() as Driver;
                resolve({
                  data: { userInfo: data.userInfo, online: data.online },
                });
              } else {
                resolve({ error: { message: "Driver not found", data: "" } });
              }
              unsub();
            }
          );
        });
      },
      providesTags: ["UserData"],
    }),

    fetchDriverProfile: builder.query<Driver, string>({
      queryFn: async (driverId) => {
        if (!driverId) {
          return { error: { message: "No driver ID provided", data: "" } };
        }
        try {
          const driverRef = doc(db, "drivers", driverId);
          const driverSnapshot = await getDoc(driverRef);

          if (driverSnapshot.exists()) {
            return {
              data: driverSnapshot.data() as Driver,
            };
          } else {
            return { error: { message: "Driver not found", data: "" } };
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Error fetching driver profile:", message);
          return { error: { message, data: "" } };
        }
      },
      providesTags: ["DriverProfile"],
    }),

    fetchPickUpOrders: builder.query<
      OrderType[],
      { accessToken: string; driverUid: string }
    >({
      queryFn: async ({ accessToken, driverUid }) => {
        if (!accessToken || !driverUid) {
          return { data: [] };
        }
        try {
          const ordersRef = collection(db, "orders", accessToken, "openQueue");
          const q = query(
            ordersRef,
            where("delivery.uid", "==", driverUid)
          );
          const snapshot = await getDocs(q);
          const orders = snapshot.docs.map((doc) => doc.data() as OrderType);
          return { data: orders };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Error fetching pickup orders:", message);
          return { error: { message, data: "" } };
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "OrderStatus" as const,
                id,
              })),
            ]
          : [],
    }),

    setOrderStatus: builder.mutation<
      void,
      {
        orderId: string;
        compositeOrderId: string;
        accessToken: string;
        status: OrderStatusType;
        driverUid: string;
      }
    >({
      queryFn: async ({ orderId, compositeOrderId, accessToken, status, driverUid }) => {
        try {
          const openQueueRef = doc(
            db,
            "orders",
            accessToken,
            "openQueue",
            compositeOrderId
          );

          if (status === "DELIVERED" || status === "CANCELED" || status === "VOIDED") {
            const batch = writeBatch(db);
            batch.delete(openQueueRef);

            const targetCollection =
              status === "DELIVERED" ? "completedOrders" : "voidedOrders";
            const targetRef = doc(
              db,
              "orders",
              accessToken,
              targetCollection,
              compositeOrderId
            );
            batch.set(targetRef, {
              orderId,
              status: { current: status },
              delivery: { uid: driverUid },
            });

            await batch.commit();
          } else {
            await updateDoc(openQueueRef, {
              "status.current": status,
            });
          }

          return { data: undefined };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Error updating order status:", message);
          return { error: { message, data: "" } };
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "OrderStatus", id: arg.orderId },
        "PickUpOrders",
      ],
    }),
  }),
});

export const {
  useFetchDriverProfileQuery,
  useLazyFetchDriverProfileQuery,
  useLazyFetchUserDataQuery,
  useFetchUserDataQuery,
  useFetchPickUpOrdersQuery,
  useLazyFetchPickUpOrdersQuery,
  useSetOrderStatusMutation,
} = firestoreApi;
