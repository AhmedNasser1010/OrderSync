"use client";

import { useMyOrders, useMarketplaceOrders } from "@/hooks/useOrders";
import { useOrderActions } from "@/hooks/useOrderActions";
import useNewOrderAlert from "@/hooks/useNewOrderAlert";
import { useAuth } from "@/contexts/AuthContext";
import type { OrderType } from "@ordersync/types";
import { useMemo, useState } from "react";
import { OrderSearchBar } from "@/components/orders/OrderSearchBar";
import { NoOrders } from "@/components/orders/NoOrders";
import { OrderCard } from "@/components/orders/OrderCard";

function matchesSearch(order: OrderType, query: string) {
  const haystack = [
    order.id,
    `#${order.orderNumber}`,
    order.orderNumber.toString(),
    order.customer?.name ?? "",
    order.business?.name ?? "",
    order.delivery?.address ?? "",
    order.status?.current ?? "",
    order.cart
      ?.map((item) => `${item.name} ${item.selectedSize} ${item.quantity}`)
      .join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export default function ActiveOrdersPage() {
  const { user } = useAuth();
  const driverUid = user?.uid ?? "";
  const { orders, isLoading, error } = useMyOrders();
  const { orders: marketplaceOrders } = useMarketplaceOrders();
  const actions = useOrderActions();
  const [searchQuery, setSearchQuery] = useState("");

  const hasNoActiveOrders = orders.length === 0;
  useNewOrderAlert(marketplaceOrders.length, hasNoActiveOrders);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const isSearching = normalizedSearch.length > 0;

  const visibleOrders = useMemo(() => {
    if (!isSearching) return orders;
    return orders.filter((order) => matchesSearch(order, normalizedSearch));
  }, [isSearching, normalizedSearch, orders]);

  const isSearchEmpty = isSearching && visibleOrders.length === 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-destructive">Failed to load orders</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4">
        <OrderSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search orders by number, customer, item, or status"
        />
      </div>

      {isSearchEmpty ? (
        <NoOrders
          title="No matching orders"
          description="Try a different order number, customer name, item, or status"
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery("")}
        />
      ) : orders.length === 0 ? (
        <NoOrders
          title="No active orders"
          description="Claim an order from the Marketplace to get started"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {visibleOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              variant="active"
              driverUid={driverUid}
              actions={actions}
            />
          ))}
        </div>
      )}
    </div>
  );
}