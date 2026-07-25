"use client";

import { useTranslations } from "next-intl";
import type { TodayData } from "@/lib/types/types";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  AlertCircle,
} from "lucide-react";

interface TodayKPICardsProps {
  data: TodayData;
}

export function TodayKPICards({ data }: TodayKPICardsProps) {
  const t = useTranslations("Dashboard.today");

  const kpis = [
    {
      label: t("revenue"),
      value: data.totalRevenue.toFixed(0),
      icon: TrendingUp,
    },
    {
      label: t("orders"),
      value: data.totalOrders,
      icon: ShoppingCart,
    },
    {
      label: t("avgOrderValue"),
      value: data.avgOrderValue.toFixed(0),
      icon: DollarSign,
    },
    {
      label: t("cancellationRate"),
      value: `${data.cancellationRate}%`,
      icon: AlertCircle,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 px-4 py-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="bg-card border border-border rounded-2xl p-3 flex flex-col"
          >
            <div className="flex items-start justify-between mb-2">
              <Icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground mb-1">
              {kpi.label}
            </div>
            <p className="text-lg font-bold text-card-foreground">
              {kpi.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
