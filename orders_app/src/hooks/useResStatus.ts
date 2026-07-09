import { useAppSelector } from "@/rtk/hooks";
import {
  useFetchRestaurantDataQuery,
  useFetchUserDataQuery,
} from "@/rtk/api/firestoreApi";
import { userUid } from "@/rtk/slices/constantsSlice";
import { useSetRestaurantStatusMutation } from "@/rtk/api/firestoreApi";
import type { RestaurantStatusTypes } from "@ordersync/types";
import { skipToken } from "@reduxjs/toolkit/query";

type UseResStatus = {
  toggleResStatus: () => void;
  isLoading: boolean;
  error: unknown;
  currentStatus: RestaurantStatusTypes;
  isAvailableFeature: boolean;
};

const useResStatus = (): UseResStatus => {
  const uid = useAppSelector(userUid);
  const { data: userData } = useFetchUserDataQuery(uid ? uid : skipToken);
  const { data: resData } = useFetchRestaurantDataQuery(
    userData?.accessToken ?? skipToken,
  );
  const currentStatus = resData?.status || "inactive";
  const isAvailableFeature = false;
  const [setRestaurantStatus, { isLoading, error }] =
    useSetRestaurantStatusMutation();

  const toggleResStatus = () => {
    const statusOrder: RestaurantStatusTypes[] = [
      "active",
      "inactive",
      "busy",
      "pause",
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const newIndex = (currentIndex + 1) % statusOrder.length;
    const newStatus = statusOrder[newIndex];
    setRestaurantStatus({ resId: userData?.accessToken, status: newStatus });
  };

  return {
    toggleResStatus,
    isLoading,
    error,
    currentStatus,
    isAvailableFeature,
  };
};

export default useResStatus;
