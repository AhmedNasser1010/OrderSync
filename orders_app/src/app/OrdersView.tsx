"use client";

import OrderCard from "../components/order-card/OrderCard";
import useOrders from "@/hooks/useOrders";
import { useAppSelector } from "@/rtk/hooks";
import { activeTab } from "@/rtk/slices/toggleSlice";
import OrderCardSkeleton from "@/components/shimmer/OrderCardSkeleton";
import NoOrders from "@/components/NoOrders";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function OrdersView() {
  const { formattedOrders, isLoading, isError } = useOrders();
  const activeTabValue = useAppSelector(activeTab);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground mb-4">Failed to load orders</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!formattedOrders || formattedOrders.length === 0) {
    return <NoOrders />;
  }

  return (
    <div className="flex flex-col gap-3">
      {formattedOrders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          activeTabValue={activeTabValue}
        />
      ))}
    </div>
  );
}
