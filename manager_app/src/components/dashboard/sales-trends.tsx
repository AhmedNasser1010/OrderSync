"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChartDataPoint } from "@/lib/types/types";
import { WidgetHelp } from "@/components/ui/widget-help";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SalesTrendsProps {
  data: ChartDataPoint[];
}

export function SalesTrends({ data }: SalesTrendsProps) {
  const t = useTranslations("Dashboard.salesTrends");
  const [metric, setMetric] = useState<"revenue" | "orders">("revenue");

  const toggleMetric = () => {
    setMetric(metric === "revenue" ? "orders" : "revenue");
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-card-foreground flex items-center gap-1">
          {t("title")}
          <WidgetHelp widgetKey="salesTrends" />
        </h3>
        <button
          onClick={toggleMetric}
          className="text-xs font-medium px-2.5 py-1 bg-muted rounded-lg text-muted-foreground hover:bg-muted/80"
        >
          {metric === "revenue" ? t("revenue") : t("orders")}
        </button>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: -30, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={false}
            stroke="var(--muted-foreground)"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            stroke="var(--muted-foreground)"
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: `1px solid var(--border)`,
              borderRadius: "8px",
            }}
            cursor={{ stroke: "var(--border)" }}
          />
          <Line
            type="monotone"
            dataKey={metric}
            stroke="var(--chart-1)"
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
