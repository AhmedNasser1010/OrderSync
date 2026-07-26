"use client";

import { Card } from "@/components/ui/card";

const LEGEND_ITEMS = [
  { color: "#3b82f6", label: "Driver (online)" },
  { color: "#9ca3af", label: "Driver (offline)" },
  { color: "#ef4444", label: "Customer" },
  { color: "#22c55e", label: "Restaurant" },
  { color: "#f59e0b", label: "Active Order" },
];

export function MapLegend() {
  return (
    <Card className="absolute bottom-4 right-4 z-[1000] p-3 shadow-lg bg-card/95 backdrop-blur-sm">
      <p className="text-xs font-medium mb-2 text-muted-foreground">Legend</p>
      <div className="space-y-1.5">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
