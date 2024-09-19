import { useEffect } from "react";
import {
  useFetchUserDataQuery,
  useFetchOpenOrdersDataQuery,
  useFetchMenuDataQuery,
  useFetchCompletedOrdersDataQuery,
  useFetchVoidedOrdersDataQuery,
  useSetCloseDayMutation
} from "@/lib/rtk/api/firestoreApi";
import { userUid } from "@/lib/rtk/slices/constantsSlice";
import { useAppSelector, useAppDispatch } from "@/lib/rtk/hooks";
import { closeDayPopup, setCloseDayPopup } from "@/lib/rtk/slices/toggleSlice";
import { OrderType } from "@/types/order";
import extractDaySummary from "@/lib/data_analytics/day_scope/extractDaySummary";
import { MainMenuType } from "@/types/menu";

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
  const { data: userData } = useFetchUserDataQuery(uid, { skip: !uid });
  const [setCloseDay, { isLoading: isSaving }] = useSetCloseDayMutation();

  const { data: openOrdersData, isLoading: openOrdersIsLoading } =
    useFetchOpenOrdersDataQuery(userData?.accessToken, {
      skip: !userData?.accessToken,
    }) as FetchOrdersType;

    const {
      data: completedOrdersData,
      isLoading: completedOrdersIsLoading,
      refetch: refetchCompletedOrders,
    } = useFetchCompletedOrdersDataQuery(userData?.accessToken, {
      skip: !userData?.accessToken,
    }) as FetchOrdersType;
  
    const {
      data: voidedOrdersData,
      isLoading: voidedOrdersIsLoading,
      refetch: refetchVoidedOrders,
    } = useFetchVoidedOrdersDataQuery(userData?.accessToken, {
      skip: !userData?.accessToken,
    }) as FetchOrdersType;

    const { data: menuData, isLoading: menuIsLoading } = useFetchMenuDataQuery(
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
  }, [openOrdersData, completedOrdersData, closeDayPopupValues.isOpen]);

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
      setCloseDay({
        resId: userData?.accessToken,
        orders: allOrders,
        summaryData: extractDaySummaryData
      })
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
