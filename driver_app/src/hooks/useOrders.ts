"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/rtk/hooks";
import { selectUser } from "@/rtk/slices/authSlice";
import {
  useFetchDriverProfileQuery,
  useFetchMarketplaceOrdersQuery,
  useFetchMyOrdersQuery,
} from "@/rtk/api/firestoreApi";

export function useMarketplaceOrders() {
  const authUser = useAppSelector(selectUser);
  const driverUid = authUser?.uid ?? "";

  const { data: orders, isLoading, error } = useFetchMarketplaceOrdersQuery(
    driverUid,
    { skip: !driverUid },
  );

  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [orders]);

  return {
    orders: sortedOrders,
    isLoading,
    error,
  };
}

export function useMyOrders() {
  const authUser = useAppSelector(selectUser);
  const driverUid = authUser?.uid ?? "";

  const { data: orders, isLoading, error } = useFetchMyOrdersQuery(
    driverUid,
    { skip: !driverUid },
  );

  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  }, [orders]);

  return {
    orders: sortedOrders,
    isLoading,
    error,
  };
}
