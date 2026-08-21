"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { MapPin, ShoppingBag, Store, Timer } from "lucide-react";
import { usePreparingOrders, type PreparingOrderWithEta } from "@/hooks/useOrders";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NoOrders } from "@/components/orders/NoOrders";

const TICK_MS = 30_000;
const SOON_THRESHOLD_MS = 5 * 60 * 1000;

function PreparingOrderCard({ order, estimatedReadyAt, now }: PreparingOrderWithEta & { now: number }) {
  const tOrderCard = useTranslations("orderCard");
  const locale = useLocale();
  const businessName =
    locale === "ar"
      ? order.business?.nameInAr || order.business?.name || ""
      : order.business?.name || "";
  const address = order.delivery?.address ?? "";
  const customerName = order.customer?.name ?? "";
  const totalPrice = order.pricing?.total ?? 0;
  const itemCount = order.cart?.length ?? 0;

  const remainingMs = estimatedReadyAt - now;
  const minutes = Math.max(0, Math.ceil(remainingMs / 60_000));
  const isSoon = remainingMs <= SOON_THRESHOLD_MS;

  return (
    <Card
      className={cn(
        "border-l-4 p-4",
        isSoon ? "border-l-green-600" : "border-l-amber-400",
      )}
    >
      <div className="space-y-3">
        {/* Header: ETA badge + Order # */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full",
              isSoon
                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
            )}
          >
            <Timer className={cn("size-3 shrink-0", isSoon && "animate-pulse")} />
            {isSoon ? tOrderCard("readySoon") : tOrderCard("readyIn", { minutes })}
          </span>
          <span className="text-sm font-bold tabular-nums">
            #{order.orderNumber}
          </span>
        </div>

        {/* Restaurant + Address */}
        <div className="space-y-1.5">
          {businessName && (
            <div className="flex items-center gap-1.5">
              <Store className="size-3.5 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium truncate">{businessName}</span>
            </div>
          )}
          {address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {address}
              </span>
            </div>
          )}
        </div>

        {/* Customer + Price / Items */}
        <div className="flex items-center justify-between text-sm">
          <span className="truncate text-muted-foreground">{customerName}</span>
          <span className="font-semibold tabular-nums shrink-0 ml-2">
            {totalPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShoppingBag className="size-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {tOrderCard(itemCount === 1 ? "item" : "items", { count: itemCount })}
          </span>
        </div>
      </div>
    </Card>
  );
}

export function PreparingOrders() {
  const t = useTranslations("marketplace");
  const { orders, isLoading } = usePreparingOrders();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <NoOrders
        title={t("noOrdersAvailable")}
        description={t("noOrdersAvailableDesc")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-500">
      <div className="text-center space-y-1 pt-2">
        <h2 className="text-lg font-semibold text-foreground">
          {t("almostReadyTitle")}
        </h2>
        <p className="max-w-xs mx-auto text-sm text-muted-foreground">
          {t("almostReadyDesc")}
        </p>
      </div>
      {orders.map((item) => (
        <PreparingOrderCard key={item.order.id} {...item} now={now} />
      ))}
    </div>
  );
}
