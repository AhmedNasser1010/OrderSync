"use client";

import { Card } from "@/components/ui/card";
import { Truck, Users, Store, ShoppingBag } from "lucide-react";

interface MapStatsBarProps {
  counts: {
    drivers: number;
    customers: number;
    restaurants: number;
    orders: number;
  };
}

export function MapStatsBar({ counts }: MapStatsBarProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
      <Card className="flex flex-row items-center gap-4 px-4 py-2 shadow-lg bg-card/95 backdrop-blur-sm">
        <StatItem
          icon={<Truck className="h-3.5 w-3.5" />}
          label="Drivers"
          value={counts.drivers}
          color="text-blue-500"
        />
        <div className="w-px h-4 bg-border" />
        <StatItem
          icon={<Users className="h-3.5 w-3.5" />}
          label="Customers"
          value={counts.customers}
          color="text-red-500"
        />
        <div className="w-px h-4 bg-border" />
        <StatItem
          icon={<Store className="h-3.5 w-3.5" />}
          label="Restaurants"
          value={counts.restaurants}
          color="text-green-500"
        />
        <div className="w-px h-4 bg-border" />
        <StatItem
          icon={<ShoppingBag className="h-3.5 w-3.5" />}
          label="Orders"
          value={counts.orders}
          color="text-amber-500"
        />
      </Card>
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={color}>{icon}</span>
      <span className="text-xs text-muted-foreground hidden sm:inline">
        {label}
      </span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
}
