"use client";

import { useTranslations } from "next-intl";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface TodayStatusBreakdownProps {
  statusBreakdown: Record<string, number>;
}

const STATUS_COLORS: Record<string, string> = {
  RECEIVED: "#6366f1",
  ACCEPTED: "#3b82f6",
  PREPARING: "#f59e0b",
  READY: "#10b981",
  RESERVED: "#8b5cf6",
  PICKED_UP: "#ec4899",
  ON_ROUTE: "#f97316",
  DELIVERED: "#22c55e",
  GIVEN_FEEDBACK: "#14b8a6",
  CANCELED: "#ef4444",
  REJECTED: "#6b7280",
  VOIDED: "#9ca3af",
};

const FALLBACK_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function TodayStatusBreakdown({
  statusBreakdown,
}: TodayStatusBreakdownProps) {
  const t = useTranslations("Dashboard.today");
  const entries = Object.entries(statusBreakdown).sort(
    (a, b) => b[1] - a[1],
  );
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  const chartData = entries.map(([status, count]) => ({
    name: status,
    value: count,
  }));

  if (entries.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">
        {t("statusBreakdown")}
      </h3>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
            isAnimationActive={false}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  STATUS_COLORS[entry.name] ||
                  FALLBACK_COLORS[index % FALLBACK_COLORS.length]
                }
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {entries.map(([status, count], idx) => {
          const color =
            STATUS_COLORS[status] ||
            FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
          const percentage =
            total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;

          return (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-muted-foreground">{status}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-card-foreground">
                  {percentage}%
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({count})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
