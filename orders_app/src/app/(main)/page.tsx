"use client";

import OrdersView from "@/app/OrdersView";
import useOrders from "@/hooks/useOrders";
import useNewOrderAlert from "@/hooks/useNewOrderAlert";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import useCriticalOrderAlerts from "@/hooks/useCriticalOrderAlerts";

export default function OrdersPage() {
  const { counts, receivedOrders, preparingOrders } = useOrders();

  useNewOrderAlert(counts.RECEIVED);
  useDocumentTitle(counts.RECEIVED);
  useCriticalOrderAlerts(receivedOrders, preparingOrders);

  return (
    <div className="px-4 pb-40 pt-6">
      <OrdersView />
    </div>
  );
}
