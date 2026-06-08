import { useMemo } from "react";
import { useFetchUserDataQuery } from "@/lib/rtk/api/firestoreApi";
import { useAppSelector } from "@/lib/rtk/hooks";
import { userUid } from "@/lib/rtk/slices/constantsSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { User } from "@/lib/types/types";

type UseUserResult = {
  name: string;
  user?: User;
  isLoading: boolean;
  isError: boolean;
  refetch?: () => void;
};

const useUser = (): UseUserResult => {
  const uid = useAppSelector(userUid);

  const {
    data: user,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useFetchUserDataQuery(uid ?? skipToken);

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
