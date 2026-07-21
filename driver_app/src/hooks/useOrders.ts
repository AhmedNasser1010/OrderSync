"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useFetchDriverProfileQuery,
  useFetchMarketplaceOrdersQuery,
  useFetchMyOrdersQuery,
} from "@/rtk/api/firestoreApi";

export function useMarketplaceOrders() {
  const { user } = useAuth();
  const driverUid = user?.uid ?? "";

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
  const { user } = useAuth();
  const driverUid = user?.uid ?? "";

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
