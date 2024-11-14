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

  const filteredOrders =
    activeTabValue === "VOIDED"
      ? formattedOrders?.filter((order) =>
          ["CANCELED", "REJECTED"].includes(order.status)
        )
      : activeTabValue === "DELIVERY"
      ? formattedOrders?.filter((order) =>
          ["PICK_UP", "ON_ROUTE"].includes(order.status)
        )
      : activeTabValue === "COMPLETED"
      ? formattedOrders?.filter((order) =>
          ["COMPLETED", "DELIVERED"].includes(order.status)
        )
      : formattedOrders?.filter((order) => order.status === activeTabValue) ||
        [];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {isLoading && <OrderCardSkeleton />}
      {isLoading && <OrderCardSkeleton />}
      {isLoading && <OrderCardSkeleton />}

      {filteredOrders && filteredOrders?.length ? (
        filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            activeTabValue={activeTabValue}
          />
        ))
      ) : <NoOrders />}
    </div>
  );
}
