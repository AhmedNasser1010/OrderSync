"use client";

import { X, Store, MapPin, ShoppingBag, ArrowRight, Navigation, Route } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { OrderType, OrderStatusType } from "@ordersync/types";

interface MapRestaurantPopupProps {
  restaurantName: string;
  restaurantAddress?: string;
  restaurantLatlng?: [number, number];
  orders: OrderType[];
  onClose: () => void;
  onSelectOrder: (order: OrderType) => void;
  onNavigate?: (destination: [number, number], label: string) => void;
}

export function MapRestaurantPopup({
  restaurantName,
  restaurantAddress,
  restaurantLatlng,
  orders,
  onClose,
  onSelectOrder,
  onNavigate,
}: MapRestaurantPopupProps) {
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
    onNavigate(restaurantLatlng as [number, number], restaurantName);
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
              <h3 className="text-sm font-semibold">{restaurantName}</h3>
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
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        <div className="mb-2 flex items-center gap-3 text-xs">
          {availableOrders.length > 0 && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
              {availableOrders.length} available
            </span>
          )}
          {activeOrders.length > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              {activeOrders.length} active
            </span>
          )}
        </div>

        {orders.length === 0 ? (
          <p className="py-2 text-center text-xs text-muted-foreground">
            No orders from this restaurant
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
              Navigate
            </button>
            <button
              type="button"
              onClick={handleNavigate}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border/50 bg-background py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted active:scale-[0.98]"
            >
              <Navigation className="h-3.5 w-3.5" />
              Maps
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
  const status = order.status?.current as OrderStatusType;
  const isAvailable = status === "READY";
  const itemCount = order.cart?.length ?? 0;
  const customerName = order.customer?.name ?? "";
  const totalPrice = order.pricing?.total ?? 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(order)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors active:scale-[0.98]",
        isAvailable
          ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30"
          : "bg-muted/40 hover:bg-muted/60",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tabular-nums">
            #{order.orderNumber}
          </span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              isAvailable
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
            )}
          >
            {isAvailable ? "Available" : status}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <ShoppingBag className="h-3 w-3" />
          <span>
            {itemCount} {itemCount === 1 ? "item" : "items"}
            {customerName && ` · ${customerName}`}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold tabular-nums">
          {formatPrice(totalPrice)}
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </button>
  );
}
