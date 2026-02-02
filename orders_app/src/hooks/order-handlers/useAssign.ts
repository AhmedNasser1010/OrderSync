import { useCallback, useEffect, useRef } from "react";
import { useAppSelector } from "@/rtk/hooks";
import { accessToken } from "@/rtk/slices/constantsSlice";
import {
  useAssignOrderToDriverMutation,
  useFetchOpenOrdersDataQuery,
  useFetchDriversDataQuery
} from "@/rtk/api/firestoreApi";
import { Driver } from "@/types/driver";
import { skipToken } from "@reduxjs/toolkit/query";

export default function useAssign() {
  const resAccessToken = useAppSelector(accessToken);
  const { data: ordersData } = useFetchOpenOrdersDataQuery(resAccessToken ?? skipToken);
  const { data: driversData } = useFetchDriversDataQuery(resAccessToken) as { data: Driver[] };
  const [submitOrder, { isSuccess, reset }] = useAssignOrderToDriverMutation();
  const callbackRef = useRef<(() => void) | null>(null);

  const assign = useCallback(
    async (
      selectedDriver: string | null,
      orderId: string,
      callback: () => void
    ) => {
      callbackRef.current = callback;

      try {
        if (!resAccessToken) {
          throw new Error("Access token is missing");
        }

        if (!selectedDriver) {
          throw new Error("Driver is not selected");
        }

        if (!driversData || !driversData.length) {
          throw new Error("There is no drivers available");
        }

        const driverData = driversData?.find(
          (driver) => driver.uid === selectedDriver
        );

        if (!driverData) {
          throw new Error("Driver not found");
        }

        await submitOrder({
          orders: ordersData ?? [],
          orderId,
          resId: resAccessToken,
          driverData: driverData,
        }).unwrap();
      } catch (error) {
        console.error("Failed to submit the order to driver:", error);
      }
    },
    [resAccessToken, ordersData, submitOrder, driversData]
  );

  useEffect(() => {
    if (isSuccess && callbackRef.current) {
      callbackRef.current();
      callbackRef.current = null;
      reset();
    }
  }, [isSuccess, reset]);

  return assign;
}
