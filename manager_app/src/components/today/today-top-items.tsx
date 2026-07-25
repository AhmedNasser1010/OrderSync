"use client";

import { useTranslations } from "next-intl";
import { Award } from "lucide-react";

interface TodayTopItemsProps {
  items: { name: string; quantity: number; revenue: number }[];
}

export function TodayTopItems({ items }: TodayTopItemsProps) {
  const t = useTranslations("Dashboard.topItems");

  if (items.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
      <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
        <Award className="w-4 h-4" />
        {t("title")}
      </h3>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-bold text-muted-foreground w-5 text-center">
                {idx + 1}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-card-foreground truncate">
                  {item.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {item.quantity} sold
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-card-foreground ml-2">
              {item.revenue.toFixed(0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
