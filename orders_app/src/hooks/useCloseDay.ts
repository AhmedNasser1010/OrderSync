import { useState, useEffect } from "react";
import {
  useFetchOpenOrdersDataQuery,
  useFetchUserDataQuery,
} from "@/lib/rtk/api/firestoreApi";
import { userUid } from "@/lib/rtk/slices/constantsSlice";
import { useAppSelector, useAppDispatch } from "@/lib/rtk/hooks";
import { closeDayPopup, setCloseDayPopup } from "@/lib/rtk/slices/toggleSlice";
import { Order } from "@/types/order";
import summarizeOrders from "@/lib/summarizeOrders";
import OrdersPage from "@/app/page";

type UseCloseDay = {
  closeDay: () => void;
  isPassed: () => boolean;
  isLoading: boolean;
};

const useCloseDay = (): UseCloseDay => {
  const uid = useAppSelector(userUid);
  const { data: userData } = useFetchUserDataQuery(uid, { skip: !uid });
  const { data: orders } = useFetchOpenOrdersDataQuery(userData?.accessToken, {
    skip: !userData?.accessToken,
  });
  const dispatch = useAppDispatch();
  const closeDayPopupValues = useAppSelector(closeDayPopup);

  useEffect(() => {
    if (orders && closeDayPopupValues.isOpen) {
      // non-completed orders check
      const hasNonCompletedOrders = orders.some(
        (order: Order) =>
          order.status !== "COMPLETED" &&
          order.status !== "REJECTED" &&
          order.status !== "CANCELED"
      );
      // Has completed orders check
      const hasCompletedOrders = orders.some(
        (order: Order) => order.status === "COMPLETED"
      );

      dispatch(
        setCloseDayPopup({
          isLoading: false,
          errors: {
            ...closeDayPopupValues.errors,
            noQueue: {
              isPassed: !hasNonCompletedOrders,
              text: hasNonCompletedOrders
                ? "There are orders in queue, cleanup first."
                : "",
            },
            hasCompletedOrders: {
              isPassed: hasCompletedOrders,
              text: !hasCompletedOrders
                ? "You have non completed orders yet."
                : "",
            },
          },
        })
      );
    }
  }, [orders, closeDayPopupValues.isOpen]);

  const isPassed = () => {
    const errors = closeDayPopupValues?.errors;
    const noQueue = errors?.noQueue?.isPassed;
    const hasCompletedOrders = errors?.hasCompletedOrders?.isPassed;

    return !closeDayPopupValues.isLoading && noQueue && hasCompletedOrders;
  };

  const closeDay = () => {
    if (isPassed() && orders) {
      // console.log('summarizeOrders', summarizeOrders(orders));
      console.log(orders)
    }
  };

  return {
    closeDay,
    isPassed,
    isLoading: closeDayPopupValues.isLoading,
  };
};

export default useCloseDay;
