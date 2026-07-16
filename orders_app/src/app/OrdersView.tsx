"use client";

import OrderCard from "../components/order-card/OrderCard";
import useOrders from "@/hooks/useOrders";
import { useAppSelector } from "@/rtk/hooks";
import { activeTab } from "@/rtk/slices/toggleSlice";
import OrderCardSkeleton from "@/components/shimmer/OrderCardSkeleton";
import NoOrders from "@/components/NoOrders";

export default function OrdersView() {
  const { formattedOrders, isLoading } = useOrders();
  const activeTabValue = useAppSelector(activeTab);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {isLoading && <OrderCardSkeleton />}
      {isLoading && <OrderCardSkeleton />}
      {isLoading && <OrderCardSkeleton />}

      {!isLoading && formattedOrders && formattedOrders?.length ? (
        formattedOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            activeTabValue={activeTabValue}
          />
        ))
      ) : (
        !isLoading && <NoOrders />
      )}
    </div>
  );
}
