"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import OrderSearchBar from "@/components/OrderSearchBar";
import OrderCard from "../components/order-card/OrderCard";
import useOrders from "@/hooks/useOrders";
import { useAppSelector } from "@/rtk/hooks";
import { activeTab } from "@/rtk/slices/toggleSlice";
import OrderCardSkeleton from "@/components/shimmer/OrderCardSkeleton";
import NoOrders from "@/components/NoOrders";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import BatchActions from "@/components/BatchActions";

function matchesSearch(order: {
  id: string;
  orderNumber: number;
  customer: string;
  items: string;
  total: string;
  status: string;
}, query: string) {
  const haystack = [
    order.id,
    `#${order.orderNumber}`,
    order.orderNumber.toString(),
    order.customer,
    order.items,
    order.total,
    order.status,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export default function OrdersView() {
  const t = useTranslations("Orders.view");
  const ct = useTranslations("Common");
  const { formattedOrders, receivedOrders, isLoading, isError } = useOrders();
  const activeTabValue = useAppSelector(activeTab);
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const isSearching = normalizedSearch.length > 0;

  const visibleOrders = useMemo(() => {
    const orders = formattedOrders ?? [];

    if (!isSearching) return orders;

    return orders.filter((order) => matchesSearch(order, normalizedSearch));
  }, [formattedOrders, isSearching, normalizedSearch]);

  const visibleReceivedOrders = useMemo(() => {
    if (activeTabValue !== "RECEIVED") return [];
    if (!isSearching) return receivedOrders;

    const visibleIds = new Set(visibleOrders.map((order) => order.id));
    return receivedOrders.filter((order) => visibleIds.has(order.id));
  }, [activeTabValue, isSearching, receivedOrders, visibleOrders]);

  const hasOrders = (formattedOrders?.length ?? 0) > 0;
  const isSearchEmpty = isSearching && visibleOrders.length === 0;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground mb-4">{t("failedToLoad")}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {ct("retry")}
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

  return (
    <div className="flex flex-col gap-4">
      <OrderSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t("searchPlaceholder")}
      />

      {activeTabValue === "RECEIVED" && visibleReceivedOrders.length > 0 && (
        <BatchActions receivedOrders={visibleReceivedOrders} />
      )}

      {isSearchEmpty ? (
        <NoOrders
          activeTab={activeTabValue}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery("")}
        />
      ) : !hasOrders ? (
        <NoOrders activeTab={activeTabValue} />
      ) : (
        <div className="flex flex-col gap-3">
          {visibleOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              activeTabValue={activeTabValue}
            />
          ))}
        </div>
      )}
    </div>
  );
}
