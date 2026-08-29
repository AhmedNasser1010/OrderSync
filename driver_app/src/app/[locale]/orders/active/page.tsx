"use client";

import { useMyOrders, useMarketplaceOrders } from "@/hooks/useOrders";
import { useOrderActions } from "@/hooks/useOrderActions";
import useNewOrderAlert from "@/hooks/useNewOrderAlert";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessNamesMap } from "@/contexts/BusinessNamesContext";
import { useMemo, useState } from "react";
import { OrderSearchBar } from "@/components/orders/OrderSearchBar";
import { NoOrders } from "@/components/orders/NoOrders";
import { OrderCard } from "@/components/orders/OrderCard";
import { useTranslations } from "next-intl";

const stripTashkeel = (s: string) => s.replace(/[\u064B-\u065F\u0670]/g, "");
const normalize = (s: string) => stripTashkeel(s.normalize("NFKC")).toLowerCase();

function tokenMatch(text: string, queryTokens: string[]) {
  const n = normalize(text);
  return queryTokens.every((tok) => n.includes(tok));
}

export default function ActiveOrdersPage() {
  const t = useTranslations("activeOrders");
  const { user } = useAuth();
  const driverUid = user?.uid ?? "";
  const { orders, isLoading, error } = useMyOrders();
  const { orders: marketplaceOrders } = useMarketplaceOrders();
  const businessNamesMap = useBusinessNamesMap();
  const actions = useOrderActions();
  const [searchQuery, setSearchQuery] = useState("");

  const hasNoActiveOrders = orders.length === 0;
  useNewOrderAlert(marketplaceOrders.length, hasNoActiveOrders);

  const qTokens = useMemo(() => {
    const normalizedSearch = searchQuery.trim();
    return normalizedSearch
      ? normalize(normalizedSearch).split(/\s+/).filter(Boolean)
      : [];
  }, [searchQuery]);
  const isSearching = qTokens.length > 0;

  const visibleOrders = useMemo(() => {
    if (!isSearching) return orders;
    return orders.filter((order) => {
      const busId = order.business?.id;
      const busName = order.business?.name ?? "";
      const busNameAr = busId ? (businessNamesMap[busId] ?? busName) : busName;
      const busNameOrder = order.business?.nameInAr ?? "";
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
  }, [isSearching, qTokens, orders, businessNamesMap]);

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
          title={t("noActiveOrders")}
          description={t("noActiveOrdersDesc")}
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
