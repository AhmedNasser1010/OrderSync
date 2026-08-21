"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useFetchDriverProfileQuery,
  useFetchMarketplaceOrdersQuery,
  useFetchMyOrdersQuery,
  useFetchPreparingOrdersQuery,
  useFetchBusinessNamesQuery,
} from "@/rtk/api/firestoreApi";
import type { OrderType } from "@ordersync/types";

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

const DEFAULT_PREP_MINUTES = 45;

export interface PreparingOrderWithEta {
  order: OrderType;
  estimatedReadyAt: number;
}

export function usePreparingOrders() {
  const { user } = useAuth();
  const driverUid = user?.uid ?? "";

  const { data: orders, isLoading } = useFetchPreparingOrdersQuery(undefined, {
    skip: !driverUid,
  });

  const businessIds = useMemo(() => {
    if (!orders) return [];
    const ids = new Set<string>();
    for (const order of orders) {
      if (order.business?.id) ids.add(order.business.id);
    }
    return [...ids];
  }, [orders]);

  const { data: businessInfo } = useFetchBusinessNamesQuery(businessIds, {
    skip: businessIds.length === 0,
  });

  const preparingOrders = useMemo<PreparingOrderWithEta[]>(() => {
    if (!orders) return [];
    const withEta = orders.map((order) => {
      const cookTime = businessInfo?.[order.business?.id ?? ""]?.cookTime;
      const prepMinutes = Array.isArray(cookTime)
        ? cookTime[1]
        : DEFAULT_PREP_MINUTES;
      const startedAt = order.timeline?.preparingAt ?? order.createdAt;
      return {
        order,
        estimatedReadyAt: startedAt + prepMinutes * 60_000,
      };
    });
    return withEta.sort((a, b) => a.estimatedReadyAt - b.estimatedReadyAt);
  }, [orders, businessInfo]);

  return {
    orders: preparingOrders,
    isLoading,
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
    return [...orders].sort((a, b) => (a.updatedAt ?? 0) - (b.updatedAt ?? 0));
  }, [orders]);

  return {
    orders: sortedOrders,
    isLoading,
    error,
  };
}
