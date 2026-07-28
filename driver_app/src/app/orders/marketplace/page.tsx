"use client";

import { useMemo, useState } from "react";
import { useMarketplaceOrders } from "@/hooks/useOrders";
import { OrderCard } from "@/components/orders/OrderCard";
import { OrderSearchBar } from "@/components/orders/OrderSearchBar";
import { NoOrders } from "@/components/orders/NoOrders";

function matchesSearch(order: {
  id: string;
  orderNumber: number;
  customer?: { name?: string };
  business?: { name?: string };
  delivery?: { address?: string };
  status?: { current?: string };
  cart?: { name: string; selectedSize: string; quantity: number }[];
}, query: string) {
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

export default function MarketplacePage() {
  const { orders, isLoading, error } = useMarketplaceOrders();
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const isSearching = normalizedSearch.length > 0;

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          (a.timeline?.readyAt ?? a.createdAt) -
          (b.timeline?.readyAt ?? b.createdAt)
      ),
    [orders]
  );

  const visibleOrders = useMemo(() => {
    if (!isSearching) return sortedOrders;
    return sortedOrders.filter((order) =>
      matchesSearch(order, normalizedSearch)
    );
  }, [isSearching, normalizedSearch, sortedOrders]);

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
          title="No orders available"
          description="New orders will appear here"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {visibleOrders.map((order) => (
            <OrderCard key={order.id} order={order} variant="marketplace" />
          ))}
        </div>
      )}
    </div>
  );
}
