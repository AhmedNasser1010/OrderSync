import { useEffect } from "react";
import {
  useFetchUserDataQuery,
  useFetchActiveOrdersQuery,
  useFetchMenuDataQuery,
  useSetCloseDayMutation,
} from "@/rtk/api/firestoreApi";
import { userUid } from "@/rtk/slices/constantsSlice";
import { useAppSelector, useAppDispatch } from "@/rtk/hooks";
import { closeDayPopup, setCloseDayPopup } from "@/rtk/slices/toggleSlice";
import type { OrderType } from "@ordersync/types";
import type { MainMenuType } from "@ordersync/types";
import extractDaySummary from "@/analytics/day_scope/extractDaySummary";
import { skipToken } from "@reduxjs/toolkit/query";

type UseCloseDay = {
  closeDay: () => void;
  isPassed: () => boolean;
  isLoading: boolean;
  isSaving: boolean;
};

const useCloseDay = (): UseCloseDay => {
  const dispatch = useAppDispatch();
  const uid = useAppSelector(userUid);
  const closeDayPopupValues = useAppSelector(closeDayPopup);
  const { data: userData } = useFetchUserDataQuery(uid ? uid : skipToken);
  const [
    setCloseDay,
    { isLoading: isSaving, isSuccess, isError, error, reset },
  ] = useSetCloseDayMutation();

  const { data: activeOrdersData } = useFetchActiveOrdersQuery(
    userData?.accessToken ?? skipToken,
    {
      skip: !userData?.accessToken,
    },
  ) as { data?: OrderType[]; isLoading?: boolean };

  const { data: menuData } = useFetchMenuDataQuery(userData?.accessToken, {
    skip: !userData?.accessToken,
  }) as { data?: MainMenuType; isLoading?: boolean };

  useEffect(() => {
    if (activeOrdersData && closeDayPopupValues.isOpen) {
      const hasActiveOrders = activeOrdersData.length > 0;

      dispatch(
        setCloseDayPopup({
          isLoading: false,
          errors: {
            ...closeDayPopupValues.errors,
            noQueue: {
              isPassed: !hasActiveOrders,
              text: hasActiveOrders
                ? "There are active orders. Wait for them to complete before closing the day."
                : "",
            },
            hasCompletedOrders: {
              isPassed: true,
              text: "",
            },
          },
        }),
      );
    }
  }, [activeOrdersData, closeDayPopupValues.isOpen, dispatch]);

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
        }),
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
              (
                error as
                  | { data?: string; error?: string; message?: string }
                  | undefined
              )?.data ||
              (
                error as
                  | { data?: string; error?: string; message?: string }
                  | undefined
              )?.message ||
              "Failed to close day.",
          },
        }),
      );
    }
  }, [closeDayPopupValues.isOpen, dispatch, error, isError, isSuccess, reset]);

  const isPassed = () => {
    const errors = closeDayPopupValues?.errors;
    const noQueue = errors?.noQueue?.isPassed;

    return !closeDayPopupValues.isLoading && noQueue;
  };

  const closeDay = () => {
    if (isPassed() && menuData) {
      const todayDate = new Date().toISOString().split("T")[0];
      // Use all orders (including delivered, voided) for the daily summary
      // The extractDaySummary function will filter as needed
      const extractDaySummaryData = extractDaySummary(
        activeOrdersData || [],
        menuData,
        todayDate,
      );
      dispatch(
        setCloseDayPopup({
          isLoading: true,
          result: {
            type: null,
            text: "",
          },
        }),
      );
      setCloseDay({
        resId: userData?.accessToken,
        summaryData: {
          ...extractDaySummaryData,
          date: todayDate,
        },
      })
        .unwrap()
        .catch(() => {
          // Error state is handled by the effect above.
        });
    }
  };

  return {
    closeDay,
    isPassed,
    isLoading: closeDayPopupValues.isLoading,
    isSaving,
  };
};

export default useCloseDay;
