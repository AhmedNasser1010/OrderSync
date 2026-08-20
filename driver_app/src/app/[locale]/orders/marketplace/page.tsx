"use client";

import { useMemo, useState } from "react";
import { useMarketplaceOrders } from "@/hooks/useOrders";
import { useRecommendedOrders } from "@/hooks/useRecommendedOrders";
import { OrderCard } from "@/components/orders/OrderCard";
import { RecommendedOrders } from "@/components/orders/RecommendedOrders";
import { OrderSearchBar } from "@/components/orders/OrderSearchBar";
import { NoOrders } from "@/components/orders/NoOrders";
import { useBusinessNamesMap } from "@/contexts/BusinessNamesContext";
import { useTranslations } from "next-intl";

const stripTashkeel = (s: string) => s.replace(/[\u064B-\u065F\u0670]/g, "");
const normalize = (s: string) => stripTashkeel(s.normalize("NFKC")).toLowerCase();

function tokenMatch(text: string, queryTokens: string[]) {
  const n = normalize(text);
  return queryTokens.every((tok) => n.includes(tok));
}

export default function MarketplacePage() {
  const t = useTranslations("marketplace");
  const { orders, isLoading, error } = useMarketplaceOrders();
  const { recommendedOrderIds } = useRecommendedOrders();
  const businessNamesMap = useBusinessNamesMap();
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedSearch = searchQuery.trim();
  const qTokens = normalizedSearch ? normalize(normalizedSearch).split(/\s+/).filter(Boolean) : [];
  const isSearching = qTokens.length > 0;

  const sortedOrders = useMemo(
    () =>
      [...orders]
        .filter((order) => !recommendedOrderIds.has(order.id))
        .sort(
          (a, b) =>
            (a.timeline?.readyAt ?? a.createdAt) -
            (b.timeline?.readyAt ?? b.createdAt),
        ),
    [orders, recommendedOrderIds],
  );

  const visibleOrders = useMemo(() => {
    if (!isSearching) return sortedOrders;
    return sortedOrders.filter((order) => {
      const busId = (order as any).business?.id;
      const busName = (order as any).business?.name ?? "";
      const busNameAr = busId ? (businessNamesMap[busId] ?? busName) : busName;
      const busNameOrder = (order as any).business?.nameInAr ?? "";
      const haystack = [
        busName,
        busNameAr,
        busNameOrder,
        order.customer?.name ?? "",
        order.delivery?.address ?? "",
        `#${order.orderNumber}`,
        order.orderNumber.toString(),
        order.id,
        order.status?.current ?? "",
        order.cart
          ?.map((item) => `${item.name} ${item.selectedSize} ${item.quantity}`)
          .join(" "),
      ].join(" ");
      return tokenMatch(haystack, qTokens);
    });
  }, [isSearching, qTokens, sortedOrders, businessNamesMap]);

  const isSearchEmpty = isSearching && visibleOrders.length === 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
          <p className="text-sm text-muted-foreground">{t("loadingOrders")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-destructive">{t("failedToLoad")}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4">
        <OrderSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("searchPlaceholder")}
        />
      </div>

      {isSearchEmpty ? (
        <NoOrders
          title={t("noMatchingOrders")}
          description={t("noMatchingOrdersDesc")}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery("")}
        />
      ) : orders.length === 0 ? (
        <NoOrders
          title={t("noOrdersAvailable")}
          description={t("noOrdersAvailableDesc")}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <RecommendedOrders />
          {visibleOrders.map((order) => (
            <OrderCard key={order.id} order={order} variant="marketplace" />
          ))}
        </div>
      )}
    </div>
  );
}
