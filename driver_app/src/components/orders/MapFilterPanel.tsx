"use client";

import { Package, Store, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { MapFilters } from "@/app/[locale]/orders/map/page";

interface MapFilterPanelProps {
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
  orderCount: number;
  restaurantCount: number;
}

export function MapFilterPanel({
  filters,
  onFiltersChange,
  orderCount,
  restaurantCount,
}: MapFilterPanelProps) {
  const t = useTranslations("mapPage");

  const toggle = (key: keyof MapFilters) => {
    onFiltersChange({ ...filters, [key]: !filters[key] });
  };

  return (
    <div className="fixed top-16 end-4 z-[1000] flex flex-col gap-1.5 rounded-2xl border border-border/50 bg-background/80 p-2 shadow-lg backdrop-blur-xl">
      <button
        type="button"
        onClick={() => toggle("orders")}
        className={cn(
          "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          filters.orders
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Package className="h-3.5 w-3.5" />
        <span>{t("filterOrders")}</span>
        <span
          className={cn(
            "ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold",
            filters.orders
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted-foreground/20 text-muted-foreground",
          )}
        >
          {orderCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => toggle("restaurants")}
        className={cn(
          "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          filters.restaurants
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Store className="h-3.5 w-3.5" />
        <span>{t("filterRestaurants")}</span>
        <span
          className={cn(
            "ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold",
            filters.restaurants
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted-foreground/20 text-muted-foreground",
          )}
        >
          {restaurantCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => toggle("driverLocation")}
        className={cn(
          "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
          filters.driverLocation
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Crosshair className="h-3.5 w-3.5" />
        <span>{t("filterMyLocation")}</span>
      </button>
    </div>
  );
}
