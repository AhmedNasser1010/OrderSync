"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterVisibility = {
  drivers: boolean;
  customers: boolean;
  restaurants: boolean;
  orders: boolean;
};

const PRESETS: { label: string; value: string; filters: FilterVisibility }[] = [
  {
    label: "All",
    value: "all",
    filters: { drivers: true, customers: true, restaurants: true, orders: true },
  },
  {
    label: "Drivers Only",
    value: "drivers",
    filters: { drivers: true, customers: false, restaurants: false, orders: false },
  },
  {
    label: "Customers Only",
    value: "customers",
    filters: { drivers: false, customers: true, restaurants: false, orders: false },
  },
  {
    label: "Restaurants Only",
    value: "restaurants",
    filters: { drivers: false, customers: false, restaurants: true, orders: false },
  },
  {
    label: "Active Orders Only",
    value: "orders",
    filters: { drivers: false, customers: false, restaurants: false, orders: true },
  },
  {
    label: "Drivers + Restaurants + Orders",
    value: "dri",
    filters: { drivers: true, customers: false, restaurants: true, orders: true },
  },
];

interface FilterPanelProps {
  visible: FilterVisibility;
  onToggle: (key: keyof FilterVisibility) => void;
  onPresetChange: (filters: FilterVisibility) => void;
  counts: {
    drivers: number;
    customers: number;
    restaurants: number;
    orders: number;
  };
  onlineDrivers?: number;
  activeOrders?: number;
  onRefresh: () => void;
  refreshing?: boolean;
}

export function FilterPanel({
  visible,
  onToggle,
  onPresetChange,
  counts,
  onlineDrivers,
  activeOrders,
  onRefresh,
  refreshing = false,
}: FilterPanelProps) {
  const currentPreset = PRESETS.find(
    (p) =>
      p.filters.drivers === visible.drivers &&
      p.filters.customers === visible.customers &&
      p.filters.restaurants === visible.restaurants &&
      p.filters.orders === visible.orders
  );

  return (
    <Card className="absolute top-4 left-4 z-[1000] w-72 p-4 shadow-lg bg-card/95 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Live Map Filters</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onRefresh}
          disabled={refreshing}
          title="Refresh data"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            View Preset
          </label>
          <Select
            value={currentPreset?.value ?? "custom"}
            onValueChange={(val) => {
              const preset = PRESETS.find((p) => p.value === val);
              if (preset) onPresetChange(preset.filters);
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[9999]">
              {PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value} className="text-xs">
                  {preset.label}
                </SelectItem>
              ))}
              {!currentPreset && (
                <SelectItem value="custom" className="text-xs" disabled>
                  Custom
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <FilterBadge
            label="Drivers"
            checked={visible.drivers}
            count={counts.drivers}
            activeBadgeClass="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400"
            dotColor="bg-blue-500"
            onChange={() => onToggle("drivers")}
          />
          <FilterBadge
            label="Customers"
            checked={visible.customers}
            count={counts.customers}
            activeBadgeClass="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400"
            dotColor="bg-red-500"
            onChange={() => onToggle("customers")}
          />
          <FilterBadge
            label="Restaurants"
            checked={visible.restaurants}
            count={counts.restaurants}
            activeBadgeClass="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400"
            dotColor="bg-green-500"
            onChange={() => onToggle("restaurants")}
          />
          <FilterBadge
            label="Orders"
            checked={visible.orders}
            count={counts.orders}
            activeBadgeClass="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400"
            dotColor="bg-amber-500"
            onChange={() => onToggle("orders")}
          />
        </div>

        {(onlineDrivers != null || activeOrders != null) && (
          <>
            <div className="border-t border-border pt-2 space-y-1">
              {onlineDrivers != null && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Online Drivers</span>
                  <span>
                    <span className="font-medium text-foreground">
                      {onlineDrivers}
                    </span>
                    /{counts.drivers}
                  </span>
                </div>
              )}
              {activeOrders != null && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Active Orders</span>
                  <span className="font-medium text-foreground">
                    {activeOrders}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

const inactiveBadgeClass =
  "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400";

function FilterBadge({
  label,
  checked,
  count,
  activeBadgeClass,
  dotColor,
  onChange,
}: {
  label: string;
  checked: boolean;
  count: number;
  activeBadgeClass: string;
  dotColor: string;
  onChange: () => void;
}) {
  return (
    <button onClick={onChange} className="cursor-pointer">
      <Badge
        variant="outline"
        className={cn(
          "gap-1.5 px-2.5 py-1 transition-colors hover:opacity-80",
          checked ? activeBadgeClass : inactiveBadgeClass,
        )}
      >
        <span
          className={cn(
            "inline-block h-1.5 w-1.5 rounded-full",
            checked ? dotColor : "bg-gray-400 dark:bg-gray-500",
          )}
        />
        {label}
        <span className="tabular-nums">{count}</span>
      </Badge>
    </button>
  );
}
