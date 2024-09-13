"use client";

import OrderCard from "./OrderCard";
import useOrders from "@/hooks/useOrders";
import { OrderStatus } from "@/types/order";
import { useAppSelector } from '@/lib/rtk/hooks'
import { activeTab } from '@/lib/rtk/slices/toggleSlice'

export default function OrdersView() {
  const { formattedOrders } = useOrders();
  const activeTabValue = useAppSelector(activeTab)


  const filteredOrders = formattedOrders?.filter(
    (order) => order.status === activeTabValue
  ) || [];

  if (!formattedOrders?.length) {
    return <h3>Loading...</h3>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredOrders?.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
