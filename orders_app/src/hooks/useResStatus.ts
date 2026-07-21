import { useAppSelector } from "@/rtk/hooks";
import {
  useFetchRestaurantDataQuery,
  useFetchUserDataQuery,
  useSetRestaurantStatusMutation,
} from "@/rtk/api/firestoreApi";
import { userUid } from "@/rtk/slices/constantsSlice";
import type { RestaurantStatusTypes } from "@ordersync/types";
import { skipToken } from "@reduxjs/toolkit/query";

const statusOrder: RestaurantStatusTypes[] = [
  "active",
  "busy",
  "pause",
  "inactive",
];

type UseResStatus = {
  toggleResStatus: () => void;
  setResStatus: (status: RestaurantStatusTypes) => void;
  isLoading: boolean;
  error: unknown;
  currentStatus: RestaurantStatusTypes;
};

const useResStatus = (): UseResStatus => {
  const uid = useAppSelector(userUid);
  const { data: userData } = useFetchUserDataQuery(uid ? uid : skipToken);
  const { data: resData } = useFetchRestaurantDataQuery(
    userData?.accessToken ?? skipToken,
    { skip: !userData?.accessToken },
  );
  const currentStatus = resData?.status || "inactive";
  const [setRestaurantStatus, { isLoading, error }] =
    useSetRestaurantStatusMutation();

  const setResStatus = (status: RestaurantStatusTypes) => {
    setRestaurantStatus({ resId: userData?.accessToken, status });
  };

  const toggleResStatus = () => {
    const currentIndex = statusOrder.indexOf(currentStatus);
    const newIndex = (currentIndex + 1) % statusOrder.length;
    setResStatus(statusOrder[newIndex]);
  };

  return {
    toggleResStatus,
    setResStatus,
    isLoading,
    error,
    currentStatus,
  };
};

export default useResStatus;
