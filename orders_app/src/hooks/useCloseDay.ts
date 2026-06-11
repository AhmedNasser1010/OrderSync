import { useEffect } from "react";
import {
  useFetchUserDataQuery,
  useFetchOpenOrdersDataQuery,
  useFetchMenuDataQuery,
  useFetchCompletedOrdersDataQuery,
  useFetchVoidedOrdersDataQuery,
  useSetCloseDayMutation
} from "@/rtk/api/firestoreApi";
import { userUid } from "@/rtk/slices/constantsSlice";
import { useAppSelector, useAppDispatch } from "@/rtk/hooks";
import { closeDayPopup, setCloseDayPopup } from "@/rtk/slices/toggleSlice";
import { OrderType } from "@/types/order";
import extractDaySummary from "@/analytics/day_scope/extractDaySummary";
import { MainMenuType } from "@/types/menu";
import { skipToken } from "@reduxjs/toolkit/query";

type UseCloseDay = {
  closeDay: () => void;
  isPassed: () => boolean;
  isLoading: boolean;
  isSaving: boolean;
};

type FetchOrdersType = {
  data?: OrderType[];
  error?: any;
  isLoading?: boolean;
  isError?: boolean;
  refetch?: () => void;
};

type FetchMenuType = {
  data?: MainMenuType;
  error?: any;
  isLoading?: boolean;
  isError?: boolean;
}

const useCloseDay = (): UseCloseDay => {
  const dispatch = useAppDispatch();
  const uid = useAppSelector(userUid);
  const closeDayPopupValues = useAppSelector(closeDayPopup);
  const { data: userData } = useFetchUserDataQuery(uid ?? skipToken);
  const [setCloseDay, { isLoading: isSaving, isSuccess, isError, error, reset }] =
    useSetCloseDayMutation();

  const { data: openOrdersData } =
    useFetchOpenOrdersDataQuery(userData?.accessToken, {
      skip: !userData?.accessToken,
    }) as FetchOrdersType;

    const {
      data: completedOrdersData,
    } = useFetchCompletedOrdersDataQuery(userData?.accessToken, {
      skip: !userData?.accessToken,
    }) as FetchOrdersType;
  
    const {
      data: voidedOrdersData,
    } = useFetchVoidedOrdersDataQuery(userData?.accessToken, {
      skip: !userData?.accessToken,
    }) as FetchOrdersType;

    const { data: menuData } = useFetchMenuDataQuery(
      userData?.accessToken,
      { skip: !userData?.accessToken }
    ) as FetchMenuType;

  useEffect(() => {
    if (
      openOrdersData &&
      completedOrdersData &&
      closeDayPopupValues.isOpen
    ) {
      // non-completed orders check
      const hasNonCompletedOrders = openOrdersData?.length ? true : false;
      // Has completed orders check
      const hasCompletedOrders = completedOrdersData?.length ? true : false;

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
  }, [openOrdersData, completedOrdersData, closeDayPopupValues.isOpen, dispatch]);

  useEffect(() => {
    if (!closeDayPopupValues.isOpen) {
      reset();
      return;
    }

    if (isSuccess) {
      dispatch(
        setCloseDayPopup({
          isLoading: false,
          result: {
            type: "success",
            text: "Day closed successfully.",
          },
        })
      );
      return;
    }

    if (isError) {
      dispatch(
        setCloseDayPopup({
          isLoading: false,
          result: {
            type: "error",
            text:
              (error as { data?: string; error?: string; message?: string } | undefined)?.data ||
              (error as { data?: string; error?: string; message?: string } | undefined)?.message ||
              "Failed to close day.",
          },
        })
      );
    }
  }, [closeDayPopupValues.isOpen, dispatch, error, isError, isSuccess, reset]);

  const isPassed = () => {
    const errors = closeDayPopupValues?.errors;
    const noQueue = errors?.noQueue?.isPassed;
    const hasCompletedOrders = errors?.hasCompletedOrders?.isPassed;

    return !closeDayPopupValues.isLoading && noQueue && hasCompletedOrders;
  };

  const closeDay = () => {
    if (
      isPassed() &&
      completedOrdersData &&
      voidedOrdersData &&
      menuData
    ) {
      const allOrders = [...completedOrdersData, ...voidedOrdersData]
      const todayDate = new Date().toISOString().split('T')[0]
      const extractDaySummaryData = extractDaySummary(allOrders, menuData, todayDate)
      dispatch(
        setCloseDayPopup({
          isLoading: true,
          result: {
            type: null,
            text: "",
          },
        })
      );
      setCloseDay({
        resId: userData?.accessToken,
        orders: allOrders,
        summaryData: extractDaySummaryData
      }).unwrap().catch(() => {
        // Error state is handled by the effect above.
      });
    }
  };

  return {
    closeDay,
    isPassed,
    isLoading: closeDayPopupValues.isLoading,
    isSaving
  };
};

export default useCloseDay;
