"use client";

import { PaymentMethod } from "@/lib/types/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface PaymentMethodsProps {
  methods: PaymentMethod[];
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

export function PaymentMethods({ methods }: PaymentMethodsProps) {
  const chartData = methods.map((m) => ({
    name: m.name,
    value: m.percentage,
    orders: m.orders,
  }));

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">
        Payment Methods
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
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: `1px solid var(--border)`,
              borderRadius: "8px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {methods.map((method, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-xs text-muted-foreground">
                {method.name}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-card-foreground">
                {method.percentage}%
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                ({method.orders})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
