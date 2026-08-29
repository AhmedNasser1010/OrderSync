import { useEffect } from "react";
import {
  useFetchUserDataQuery,
  useFetchActiveOrdersQuery,
  useSetCloseDayMutation,
} from "@/rtk/api/firestoreApi";
import { userUid } from "@/rtk/slices/constantsSlice";
import { useAppSelector, useAppDispatch } from "@/rtk/hooks";
import { closeDayPopup, setCloseDayPopup } from "@/rtk/slices/toggleSlice";
import type { OrderType } from "@ordersync/types";
import { isFinalStatus } from "@ordersync/order-utils";
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

  useEffect(() => {
    if (activeOrdersData && closeDayPopupValues.isOpen) {
      const hasActiveOrders = activeOrdersData.some(
        (order) => !isFinalStatus(order.status.current),
      );

      dispatch(
        setCloseDayPopup({
          isLoading: false,
          errors: {
            noQueue: {
              isPassed: !hasActiveOrders,
              text: "",
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
    if (isPassed()) {
      dispatch(
        setCloseDayPopup({
          isLoading: true,
          result: {
            type: null,
            text: "",
          },
        }),
      );
      setCloseDay({ resId: userData?.accessToken })
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
