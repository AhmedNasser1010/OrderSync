"use client";

import { useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useAuth } from "@/contexts/AuthContext";
import {
  useFetchUserDataQuery,
  useFetchMarketplaceOrdersQuery,
  useFetchMyOrdersQuery,
  useFetchPreparingOrdersQuery,
  useFetchBusinessNamesQuery,
} from "@/rtk/api/firestoreApi";
import type { OrderType } from "@ordersync/types";

const useDriverVisibility = () => {
  const { user } = useAuth();
  const { data: userData } = useFetchUserDataQuery(
    user?.uid ? { uid: user.uid } : skipToken,
  );
  return {
    visibleBusinessIds: userData?.visibleBusinessIds,
    enabledByManager: userData?.online?.byManager ?? true,
  };
};

function filterVisibleBusinesses(
  orders: OrderType[],
  visibleBusinessIds: string[] | undefined,
): OrderType[] {
  if (!visibleBusinessIds || visibleBusinessIds.length === 0) return orders;
  const allowed = new Set(visibleBusinessIds);
  return orders.filter((order) =>
    allowed.has(order.businessId || order.business?.id || ""),
  );
}

function collectBusinessIds(orders: OrderType[]): string[] {
  const ids = new Set<string>();
  for (const order of orders) {
    if (order.business?.id) ids.add(order.business.id);
  }
  return [...ids];
}

export function useMarketplaceOrders() {
  const { user } = useAuth();
  const driverUid = user?.uid ?? "";
  const { visibleBusinessIds, enabledByManager } = useDriverVisibility();

  const { data: orders, isLoading, error } = useFetchMarketplaceOrdersQuery(
    driverUid,
    { skip: !driverUid },
  );

  // Orders hidden from the marketplace (marketplaceHidden == true) are
  // excluded by the Firestore query itself, not filtered here.
  const filteredOrders = useMemo(
    () =>
      enabledByManager
        ? filterVisibleBusinesses(orders ?? [], visibleBusinessIds)
        : [],
    [orders, visibleBusinessIds, enabledByManager],
  );

  const sortedOrders = useMemo(
    () =>
      [...filteredOrders].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)),
    [filteredOrders],
  );

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
  const { visibleBusinessIds, enabledByManager } = useDriverVisibility();

  // Hidden orders are excluded by the Firestore query itself.
  const { data: orders, isLoading } = useFetchPreparingOrdersQuery(undefined, {
    skip: !driverUid,
  });

  const filteredOrders = useMemo(
    () =>
      enabledByManager
        ? filterVisibleBusinesses(orders ?? [], visibleBusinessIds)
        : [],
    [orders, visibleBusinessIds, enabledByManager],
  );

  const businessIds = useMemo(
    () => collectBusinessIds(filteredOrders),
    [filteredOrders],
  );

  const { data: businessInfo } = useFetchBusinessNamesQuery(businessIds, {
    skip: businessIds.length === 0,
  });

  const preparingOrders = useMemo<PreparingOrderWithEta[]>(() => {
    if (!filteredOrders.length) return [];
    const withEta = filteredOrders.map((order) => {
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
  }, [filteredOrders, businessInfo]);

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
