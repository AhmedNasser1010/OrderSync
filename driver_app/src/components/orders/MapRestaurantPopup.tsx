"use client";

import { X, Store, MapPin, ShoppingBag, ArrowRight, ArrowLeft, Navigation, Route, AlarmClock } from "lucide-react";
import { cn, formatPrice, formatRelativeTime } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { STATUS_TRANSLATION_KEY } from "./OrderCard";
import { useBusinessDisplayName } from "@/contexts/BusinessNamesContext";
import type { OrderType, OrderStatusType } from "@ordersync/types";

const STALE_WARNING_MS = 3 * 60 * 1000;
const STALE_CRITICAL_MS = 7 * 60 * 1000;

type StaleLevel = "none" | "warning" | "critical";

function getStaleLevel(readyAt: number): StaleLevel {
  const elapsed = Date.now() - readyAt;
  if (elapsed >= STALE_CRITICAL_MS) return "critical";
  if (elapsed >= STALE_WARNING_MS) return "warning";
  return "none";
}
interface MapRestaurantPopupProps {
  businessId?: string;
  restaurantName: string;
  restaurantAddress?: string;
  restaurantLatlng?: [number, number];
  orders: OrderType[];
  onClose: () => void;
  onSelectOrder: (order: OrderType) => void;
  onNavigate?: (destination: [number, number], label: string) => void;
}

export function MapRestaurantPopup({
  businessId,
  restaurantName,
  restaurantAddress,
  restaurantLatlng,
  orders,
  onClose,
  onSelectOrder,
  onNavigate,
}: MapRestaurantPopupProps) {
  const t = useTranslations("mapPage");
  const displayName = useBusinessDisplayName(businessId, restaurantName);

  const availableOrders = orders.filter(
    (o) => (o.status?.current as OrderStatusType) === "READY",
  );
  const activeOrders = orders.filter(
    (o) => (o.status?.current as OrderStatusType) !== "READY",
  );

  const hasLocation =
    restaurantLatlng && restaurantLatlng[0] && restaurantLatlng[1];

  const handleNavigate = () => {
    if (!hasLocation) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${restaurantLatlng[0]},${restaurantLatlng[1]}`,
      "_blank",
    );
  };

  const handleInAppNavigate = () => {
    if (!hasLocation || !onNavigate) return;
    onNavigate(restaurantLatlng as [number, number], displayName);
    onClose();
  };

  return (
    <div className="fixed bottom-6 left-4 right-4 z-[1100]">
      <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-xl">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Store className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{displayName}</h3>
              {restaurantAddress && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {restaurantAddress}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
            aria-label={t("close")}
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        <div className="mb-2 flex items-center gap-3 text-xs">
          {availableOrders.length > 0 && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
              {t("ordersAvailable", { count: availableOrders.length })}
            </span>
          )}
          {activeOrders.length > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              {t("ordersActive", { count: activeOrders.length })}
            </span>
          )}
        </div>

        {orders.length === 0 ? (
          <p className="py-2 text-center text-xs text-muted-foreground">
            {t("noOrdersFromRestaurant")}
          </p>
        ) : (
          <div className="max-h-[240px] space-y-1.5 overflow-y-auto">
              {availableOrders.map((order) => (
              <RestaurantOrderRow
                key={order.id}
                order={order}
                onSelect={onSelectOrder}
              />
            ))}
            {activeOrders.map((order) => (
              <RestaurantOrderRow
                key={order.id}
                order={order}
                onSelect={onSelectOrder}
              />
            ))}
          </div>
        )}

        {hasLocation && (
          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={handleInAppNavigate}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border/50 bg-background py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted active:scale-[0.98]"
            >
              <Route className="h-3.5 w-3.5" />
              {t("navigate")}
            </button>
            <button
              type="button"
              onClick={handleNavigate}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border/50 bg-background py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted active:scale-[0.98]"
            >
              <Navigation className="h-3.5 w-3.5" />
              {t("maps")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RestaurantOrderRow({
  order,
  onSelect,
}: {
  order: OrderType;
  onSelect: (order: OrderType) => void;
}) {
  const ct = useTranslations("orderCard");
  const locale = useLocale();
  const status = order.status?.current as OrderStatusType;
  const isAvailable = status === "READY";
  const readyAt = order.timeline?.readyAt ?? order.createdAt;
  const [staleLevel, setStaleLevel] = useState<StaleLevel>(
    isAvailable ? getStaleLevel(readyAt) : "none",
  );
  const [prevConfig, setPrevConfig] = useState({ isAvailable, readyAt });
  if (
    prevConfig.isAvailable !== isAvailable ||
    prevConfig.readyAt !== readyAt
  ) {
    setPrevConfig({ isAvailable, readyAt });
    setStaleLevel(isAvailable ? getStaleLevel(readyAt) : "none");
  }
  const isWarning = staleLevel === "warning";
  const isCritical = staleLevel === "critical";

  useEffect(() => {
    if (!isAvailable) return;
    const interval = setInterval(
      () => setStaleLevel(getStaleLevel(readyAt)),
      30_000,
    );
    return () => clearInterval(interval);
  }, [isAvailable, readyAt]);

  const itemCount = order.cart?.length ?? 0;
  const customerName = order.customer?.name ?? "";
  const totalPrice = order.pricing?.total ?? 0;

  const rowBg = isCritical
    ? "bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
    : isWarning
      ? "bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30"
      : isAvailable
        ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30"
        : "bg-muted/40 hover:bg-muted/60";

  const badgeStyle = isCritical
    ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
    : isWarning
      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
      : isAvailable
        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
        : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";

  const badgeLabel = isCritical
    ? ct("urgent")
    : isWarning
      ? ct("waiting")
      : isAvailable
        ? ct(STATUS_TRANSLATION_KEY["READY"])
        : ct(STATUS_TRANSLATION_KEY[status] ?? "available");

  return (
    <button
      type="button"
      onClick={() => onSelect(order)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors active:scale-[0.98]",
        rowBg,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tabular-nums">
            #{order.orderNumber}
          </span>
          <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", badgeStyle)}>
            {badgeLabel}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <ShoppingBag className="h-3 w-3" />
          <span>
            {ct(itemCount === 1 ? "item" : "items", { count: itemCount })}
            {customerName && ` · ${customerName}`}
          </span>
          {isAvailable && readyAt > 0 && (
            <>
              <span>·</span>
              <AlarmClock className="h-3 w-3" />
              <span>{formatRelativeTime(readyAt)}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold tabular-nums">
          {formatPrice(totalPrice)}
        </span>
        {locale === "ar" ? (
          <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>
    </button>
  );
}
