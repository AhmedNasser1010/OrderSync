import { useAppSelector } from "@/rtk/hooks";
import {
  useFetchDriversDataQuery,
  useFetchUserDataQuery,
  useSetDriverDuesMutation,
} from "@/rtk/api/firestoreApi";
import { userUid } from "@/rtk/slices/constantsSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { type Driver } from "@/types/driver";

type UseStaff = {
  drivers: {
    data: Driver[] | [];
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
  };
  setDues: (driverId: string, duesValue: number) => void;
  addMember: () => void;
  toggleMemberOnlineStatus: (driverId: string, status: boolean) => void;
  deleteMember: (driverId: string) => void;
};

const useStaff = (): UseStaff => {
  const uid = useAppSelector(userUid);
  const { data: userData } = useFetchUserDataQuery(uid ?? skipToken);
  const { data: drivers, isLoading: driverDataIsLoading, isFetching: driverDataIsFetching, isError: driverDataIsError } = useFetchDriversDataQuery(userData?.accessToken ?? skipToken);
  const [setDriverDues] = useSetDriverDuesMutation();

  const setDues = (driverId: string, duesValue: number) => {
    setDriverDues({ driverId, duesValue });
  }

  const addMember = () => {
    // Implementation for adding a new staff member
    console.log("Add member function called");
  }

  const toggleMemberOnlineStatus = (driverId: string, status: boolean) => {
    // Implementation for toggling online status
    console.log(`Toggling online status for driver ${driverId} to ${status}`);
  }

  const deleteMember = (driverId: string) => {
    // Implementation for deleting a staff member
    console.log(`Delete member function called for driver ${driverId}`);
  }

  return {
    drivers: {
      data: drivers || [],
      isLoading: driverDataIsLoading,
      isFetching: driverDataIsFetching,
      isError: driverDataIsError
    },
    setDues,
    addMember,
    toggleMemberOnlineStatus,
    deleteMember
  };
};

export default useStaff;
