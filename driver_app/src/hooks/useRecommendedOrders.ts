"use client";

import { useMemo } from "react";
import { useMarketplaceOrders } from "@/hooks/useOrders";
import { useDriverPosition } from "@/components/LocationProvider";
import { findBestRouteGroup, type RouteGroup } from "@/utilities/routeOptimizer";

export function useRecommendedOrders(): {
  recommended: RouteGroup | null;
  recommendedOrderIds: Set<string>;
  isLoading: boolean;
  hasLocation: boolean;
} {
  const { orders, isLoading } = useMarketplaceOrders();
  const position = useDriverPosition();

  const recommended = useMemo(() => {
    if (!position || orders.length < 2) return null;
    return findBestRouteGroup([position.lat, position.lng], orders);
  }, [position, orders]);

  const recommendedOrderIds = useMemo(() => {
    if (!recommended) return new Set<string>();
    return new Set(recommended.orders.map((o) => o.id));
  }, [recommended]);

  return {
    recommended,
    recommendedOrderIds,
    isLoading,
    hasLocation: position !== null,
  };
}
