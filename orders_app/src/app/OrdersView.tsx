"use client";

import OrderCard from "./OrderCard";
import useOrders from "@/hooks/useOrders";
import { useAppSelector } from "@/lib/rtk/hooks";
import { activeTab } from "@/lib/rtk/slices/toggleSlice";
import OrderCardSkeleton from "@/components/shimmer/OrderCardSkeleton";
import NoOrders from "@/components/NoOrders";

export default function OrdersView() {
  const { formattedOrders } = useOrders();
  const activeTabValue = useAppSelector(activeTab);

  const filteredOrders =
    formattedOrders?.filter((order) => order.status === activeTabValue) || [];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredOrders?.length > 0 ? (
        filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            activeTabValue={activeTabValue}
          />
        ))
      ) : formattedOrders?.length !== filteredOrders?.length ? (
        <NoOrders />
      ) : (
        <OrderCardSkeleton />
      )}
    </div>
  );
}
