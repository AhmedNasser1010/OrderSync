import { useMemo } from "react";
import { useFetchUserDataQuery } from "@/rtk/api/firestoreApi";
import { useAuth } from "@/contexts/AuthContext";
import { skipToken } from "@reduxjs/toolkit/query";
import type { Driver } from "@ordersync/types";

type UseUserResult = {
  name: string;
  userData: Pick<Driver, "userInfo" | "online"> | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch?: () => void;
};

const useUser = (): UseUserResult => {
  const { user } = useAuth();

  const {
    data: userData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useFetchUserDataQuery(user ? { uid: user.uid } : skipToken);

  const result = useMemo(() => {
    return {
      name: userData?.userInfo?.name ?? "?",
      userData,
      isLoading: Boolean(isLoading || isFetching),
      isError: Boolean(isError),
      refetch,
    };
  }, [userData, isLoading, isFetching, isError, refetch]);

  return result;
};

export default useUser;
