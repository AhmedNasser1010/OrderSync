"use client";

import { useState } from "react";
import { useMarketplaceOrders, useMyOrders } from "@/hooks/useOrders";
import { useDriverPosition } from "@/components/LocationProvider";
import { FullMap } from "@/components/orders/FullMap";

export type MapFilters = {
  orders: boolean;
  restaurants: boolean;
  driverLocation: boolean;
};

export default function MapPage() {
  const { orders: marketplaceOrders, isLoading: marketplaceLoading } =
    useMarketplaceOrders();
  const { orders: myOrders, isLoading: myLoading } = useMyOrders();
  const driverPosition = useDriverPosition();

  const [filters, setFilters] = useState<MapFilters>({
    orders: true,
    restaurants: true,
    driverLocation: true,
  });

  const isLoading = marketplaceLoading || myLoading;

  if (isLoading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <FullMap
      marketplaceOrders={marketplaceOrders}
      myOrders={myOrders}
      driverPosition={driverPosition}
      filters={filters}
      onFiltersChange={setFilters}
    />
  );
}
