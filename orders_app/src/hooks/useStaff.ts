// import { useAppSelector } from "@/rtk/hooks";
// import {
//   useDeleteDriverMutation,
//   useFetchDriversDataQuery,
//   useFetchUserDataQuery,
//   useSetDriverDuesMutation,
//   useSetDriverStatusMutation,
//   useSetNewDriverMutation,
// } from "@/rtk/api/firestoreApi";
// import { userUid } from "@/rtk/slices/constantsSlice";
// import { skipToken } from "@reduxjs/toolkit/query";
// import { type Driver } from "@/types/driver";
// import { FormSchemaToggle } from "@/components/features/staff/StatusToggle";

// type UseStaff = {
//   drivers: {
//     data: Driver[] | [];
//     isLoading: boolean;
//     isFetching: boolean;
//     isError: boolean;
//   };
//   setDues: (driverId: string, duesValue: number) => void;
//   addNewDriver: {
//     trigger: (data: {
//       email: string;
//       name: string;
//       phone: string;
//       uid: string;
//     }) => Promise<unknown>;
//     isLoading: boolean;
//     isError: boolean;
//   };
//   toggleMemberStatus: {
//     trigger: (data: FormSchemaToggle) => Promise<unknown>;
//     isLoading: boolean;
//     isError: boolean;
//   };
//   deleteMember: {
//     trigger: (driverId: string) => Promise<unknown>;
//     isLoading: boolean;
//     isError: boolean;
//   };
// };

// const useStaff = (): UseStaff => {
//   const uid = useAppSelector(userUid);
//   const { data: userData } = useFetchUserDataQuery(uid ?? skipToken);
//   const {
//     data: drivers,
//     isLoading: driverDataIsLoading,
//     isFetching: driverDataIsFetching,
//     isError: driverDataIsError,
//   } = useFetchDriversDataQuery(userData?.accessToken ?? skipToken);
//   const [setDriverDues] = useSetDriverDuesMutation();
//   const [
//     setDriverStatus,
//     { isLoading: driverStatusIsLoading, isError: driverStatusIsError },
//   ] = useSetDriverStatusMutation();
//   const [
//     deleteDriver,
//     { isLoading: deleteDriverIsLoading, isError: deleteDriverIsError },
//   ] = useDeleteDriverMutation();
//   const [
//     setNewDriver,
//     { isLoading: setNewDriverIsLoading, isError: setNewDriverIsError },
//   ] = useSetNewDriverMutation();

//   const setDues = (driverId: string, duesValue: number) => {
//     setDriverDues({ driverId, duesValue });
//   };

//   const addMember = (data: {
//     email: string;
//     name: string;
//     phone: string;
//     uid: string;
//   }) => {
//     return setNewDriver({
//       partnerUid: userData?.partnerUid || "",
//       accessToken: userData?.accessToken || "",
//       ...data,
//     }).unwrap();
//   };

//   return {
//     drivers: {
//       data: drivers || [],
//       isLoading: driverDataIsLoading,
//       isFetching: driverDataIsFetching,
//       isError: driverDataIsError,
//     },
//     setDues,
//     addNewDriver: {
//       trigger: addMember,
//       isLoading: setNewDriverIsLoading,
//       isError: setNewDriverIsError,
//     },
//     toggleMemberStatus: {
//       trigger: setDriverStatus,
//       isLoading: driverStatusIsLoading,
//       isError: driverStatusIsError,
//     },
//     deleteMember: {
//       trigger: deleteDriver,
//       isLoading: deleteDriverIsLoading,
//       isError: deleteDriverIsError,
//     },
//   };
// };

// export default useStaff;


import { useMemo } from "react";
import { useAppSelector } from "@/rtk/hooks";
import {
  useDeleteDriverMutation,
  useFetchDriversDataQuery,
  useFetchUserDataQuery,
  useSetDriverDuesMutation,
  useSetDriverStatusMutation,
  useSetNewDriverMutation,
} from "@/rtk/api/firestoreApi";
import { userUid } from "@/rtk/slices/constantsSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { type Driver } from "@/types/driver";
import { FormSchemaToggle } from "@/components/features/staff/StatusToggle";

type UseStaff = {
  drivers: {
    data: Driver[];
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
  };
  setDues: (driverId: string, duesValue: number) => void;
  addNewDriver: {
    trigger: (data: {
      email: string;
      name: string;
      phone: string;
      uid: string;
    }) => Promise<unknown>;
    isLoading: boolean;
    isError: boolean;
  };
  toggleMemberStatus: {
    trigger: (data: FormSchemaToggle) => Promise<unknown>;
    isLoading: boolean;
    isError: boolean;
  };
  deleteMember: {
    trigger: (driverId: string) => Promise<unknown>;
    isLoading: boolean;
    isError: boolean;
  };
};

const useStaff = (): UseStaff => {
  const uid = useAppSelector(userUid);
  const { data: userData } = useFetchUserDataQuery(uid ?? skipToken);
  const {
    data: driversData,
    isLoading: driversLoading,
    isFetching: driversFetching,
    isError: driversError,
  } = useFetchDriversDataQuery(userData?.accessToken ?? skipToken);

  const [setDriverDues] = useSetDriverDuesMutation();
  const [setDriverStatus, { isLoading: statusLoading, isError: statusError }] =
    useSetDriverStatusMutation();
  const [deleteDriver, { isLoading: deleteLoading, isError: deleteError }] =
    useDeleteDriverMutation();
  const [setNewDriver, { isLoading: addLoading, isError: addError }] =
    useSetNewDriverMutation();

  const setDues = (driverId: string, duesValue: number) => {
    setDriverDues({ driverId, duesValue });
  };

  const addNewDriverTrigger = (data: {
    email: string;
    name: string;
    phone: string;
    uid: string;
  }) => {
    return setNewDriver({
      partnerUid: userData?.partnerUid || "",
      accessToken: userData?.accessToken || "",
      ...data,
    }).unwrap();
  };

  const drivers = useMemo(
    () => ({
      data: driversData || [],
      isLoading: driversLoading,
      isFetching: driversFetching,
      isError: driversError,
    }),
    [driversData, driversLoading, driversFetching, driversError]
  );

  return {
    drivers,
    setDues,
    addNewDriver: { trigger: addNewDriverTrigger, isLoading: addLoading, isError: addError },
    toggleMemberStatus: { trigger: setDriverStatus, isLoading: statusLoading, isError: statusError },
    deleteMember: { trigger: deleteDriver, isLoading: deleteLoading, isError: deleteError },
  };
};

export default useStaff;
