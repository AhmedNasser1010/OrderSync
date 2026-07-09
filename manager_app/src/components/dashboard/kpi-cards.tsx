"use client";

import { KPIData } from "@/lib/types/types";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { WidgetHelp } from "@/components/ui/widget-help";

interface KPICardsProps {
  kpis: KPIData[];
}

const iconMap: Record<string, React.ComponentType<any>> = {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  AlertCircle,
};

export function KPICards({ kpis }: KPICardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 py-4">
      {kpis.map((kpi, idx) => {
        const Icon = iconMap[kpi.icon] || DollarSign;
        const changeColor =
          kpi.change >= 0
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400";
        const changeSymbol = kpi.change >= 0 ? "↑" : "↓";

        const displayValue =
          typeof kpi.value === "number" ? kpi.value.toFixed(0) : kpi.value;

        return (
          <div
            key={idx}
            className="bg-card border border-border rounded-2xl p-3 flex flex-col"
          >
            <div className="flex items-start justify-between mb-2">
              <Icon className="w-5 h-5 text-muted-foreground" />
              <span className={`text-xs font-semibold ${changeColor}`}>
                {changeSymbol} {Math.abs(kpi.change)}%
              </span>
            </div>
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              {kpi.label}
              <WidgetHelp widgetKey="kpis" />
            </div>
            <p className="text-lg font-bold text-card-foreground">
              {displayValue}
            </p>
          </div>
        );
      })}
    </div>
  );
}
