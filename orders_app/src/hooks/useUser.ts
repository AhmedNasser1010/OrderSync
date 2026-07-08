import { useMemo } from "react";
import { useFetchUserDataQuery } from "@/rtk/api/firestoreApi";
import { useAppSelector } from "@/rtk/hooks";
import { userUid } from "@/rtk/slices/constantsSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import type { ManagerUser } from "@ordersync/types";

type UseUserResult = {
  name: string;
  user?: ManagerUser;
  isLoading: boolean;
  isError: boolean;
  refetch?: () => void;
};

const useUser = (): UseUserResult => {
  const uid = useAppSelector(userUid);

  const {
    data: userDataRaw,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useFetchUserDataQuery(uid ?? skipToken);

  const user = userDataRaw as ManagerUser | undefined;

  const result = useMemo(() => {
    return {
      name: user?.userInfo?.name ?? "?",
      user,
      isLoading: Boolean(isLoading || isFetching),
      isError: Boolean(isError),
      refetch,
    };
  }, [user, isLoading, isFetching, isError, refetch]);

  return result;
};

export default useUser;
