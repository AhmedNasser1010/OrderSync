"use client";

import { useTranslations } from "next-intl";
import { Activity } from "lucide-react";

interface TodayActiveOrdersProps {
  activeOrders: number;
}

export function TodayActiveOrders({ activeOrders }: TodayActiveOrdersProps) {
  const t = useTranslations("Dashboard.today");

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {t("activeOrders")}
            </p>
            <p className="text-2xl font-bold text-card-foreground">
              {activeOrders}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            Live
          </span>
        </div>
      </div>
    </div>
  );
}
