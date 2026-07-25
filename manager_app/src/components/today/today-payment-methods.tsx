"use client";

import { useTranslations } from "next-intl";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface TodayPaymentMethodsProps {
  methods: Record<string, number>;
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

export function TodayPaymentMethods({ methods }: TodayPaymentMethodsProps) {
  const t = useTranslations("Dashboard.paymentMethods");
  const entries = Object.entries(methods).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  const chartData = entries.map(([name, count]) => ({
    name,
    value: count,
  }));

  if (entries.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">
        {t("title")}
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
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
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
        {entries.map(([name, count], idx) => {
          const percentage =
            total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;

          return (
            <div key={name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-xs text-muted-foreground">{name}</span>
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
