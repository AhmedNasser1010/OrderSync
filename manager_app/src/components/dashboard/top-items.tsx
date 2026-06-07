"use client";

import { TopItem } from "@/lib/types/types";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TopItemsProps {
  items: TopItem[];
}

export function TopItems({ items }: TopItemsProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
      <h3 className="text-sm font-semibold text-card-foreground mb-3">
        Top Selling Items
      </h3>
      <div className="space-y-2">
        {items.map((item) => {
          const growthColor =
            item.growth >= 0 ? "text-green-600" : "text-red-600";
          const growthIcon = item.growth >= 0 ? TrendingUp : TrendingDown;
          const GrowthIcon = growthIcon;

          return (
            <div
              key={item.rank}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-start gap-2 flex-1">
                <span className="text-xs font-bold text-muted-foreground w-5 text-center">
                  {item.rank}
                </span>
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${item.revenue} revenue
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-semibold text-card-foreground">
                  {item.quantity}
                </span>
                <div className={`flex items-center gap-0.5 ${growthColor}`}>
                  <GrowthIcon className="w-3 h-3" />
                  <span className="text-xs font-medium">{item.growth}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button className="w-full mt-3 py-2 text-xs font-medium text-primary hover:bg-muted rounded-lg transition">
        View All Items
      </button>
    </div>
  );
}
