"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/rtk/hooks";
import { selectUser } from "@/rtk/slices/authSlice";
import {
  useFetchDriverProfileQuery,
  useFetchPickUpOrdersQuery,
} from "@/rtk/api/firestoreApi";

export function useOrders() {
  const authUser = useAppSelector(selectUser);
  const { data: driverProfile, isLoading: isDriverLoading } =
    useFetchDriverProfileQuery(authUser?.uid ?? "", {
      skip: !authUser?.uid,
    });

  const accessToken = driverProfile?.queue?.[0] ?? "";
  const driverUid = driverProfile?.uid ?? "";

  const hasQueue = driverProfile !== undefined && driverProfile.queue.length > 0;

  const { data: orders, isLoading: isOrdersLoading, error } =
    useFetchPickUpOrdersQuery(
      { accessToken, driverUid },
      { skip: !hasQueue },
    );

  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort(
      (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
    );
  }, [orders]);

  return {
    orders: sortedOrders,
    accessToken,
    isLoading: isDriverLoading || (hasQueue && isOrdersLoading),
    error,
    hasQueue,
  };
}
