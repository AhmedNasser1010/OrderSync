"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import type { RootState, AppDispatch } from "@/lib/rtk/store";
import { fetchDiscountAnalytics } from "@/lib/rtk/slices/discountAnalyticsSlice";
import type { DiscountAnalyticsData } from "@/lib/types/analytics";
import { DiscountAnalyticsSkeleton } from "./discount-analytics-skeleton";

interface DiscountAnalyticsProps {
  restaurantId: string;
}

const StatCard = ({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string | number;
  suffix?: string;
}) => (
  <div className="bg-card border border-border rounded-xl p-3 text-center">
    <div className="text-2xl font-bold text-foreground">
      {value}
      {suffix && (
        <span className="text-sm font-normal text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
    <div className="text-xs text-muted-foreground mt-1">{label}</div>
  </div>
);

export function DiscountAnalytics({ restaurantId }: DiscountAnalyticsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.discountAnalytics
  );

  useEffect(() => {
    dispatch(fetchDiscountAnalytics({ restaurantId }));
  }, [dispatch, restaurantId]);

  const totalImpressions = data.reduce((sum, d) => sum + d.impressions, 0);
  const totalRedemptions = data.reduce((sum, d) => sum + d.redemptions, 0);
  const totalRevenueImpact = data.reduce(
    (sum, d) => sum + d.revenueImpact,
    0
  );
  const avgConversion =
    totalImpressions > 0 ? (totalRedemptions / totalImpressions) * 100 : 0;

  if (loading) {
    return <DiscountAnalyticsSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 text-center">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 text-center">
        <p className="text-muted-foreground text-sm">
          No discount analytics data for this period.
        </p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.discountId.slice(0, 8),
    redemptions: d.redemptions,
    revenue: d.revenueImpact,
    impressions: d.impressions,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4">
        <StatCard label="Total Impressions" value={totalImpressions} />
        <StatCard label="Total Redemptions" value={totalRedemptions} />
        <StatCard
          label="Avg Conversion"
          value={avgConversion.toFixed(1)}
          suffix="%"
        />
        <StatCard
          label="Revenue Impact"
          value={totalRevenueImpact.toFixed(0)}
          suffix="LE"
        />
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 mx-4">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">
          Redemptions & Revenue by Discount
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              tickLine={false}
              stroke="var(--muted-foreground)"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              stroke="var(--muted-foreground)"
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="redemptions" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="revenue" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 mx-4">
        <h3 className="text-sm font-semibold text-card-foreground mb-3">
          Discount Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">
                  Discount
                </th>
                <th className="text-right py-2 text-muted-foreground font-medium">
                  Impressions
                </th>
                <th className="text-right py-2 text-muted-foreground font-medium">
                  Redemptions
                </th>
                <th className="text-right py-2 text-muted-foreground font-medium">
                  Conversion
                </th>
                <th className="text-right py-2 text-muted-foreground font-medium">
                  Revenue
                </th>
                <th className="text-right py-2 text-muted-foreground font-medium">
                  Users
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.discountId} className="border-b border-border/50">
                  <td className="py-2 font-medium">{d.discountId.slice(0, 8)}</td>
                  <td className="py-2 text-right">{d.impressions}</td>
                  <td className="py-2 text-right">{d.redemptions}</td>
                  <td className="py-2 text-right">
                    {(d.conversionRate * 100).toFixed(1)}%
                  </td>
                  <td className="py-2 text-right">{d.revenueImpact.toFixed(0)} LE</td>
                  <td className="py-2 text-right">{d.uniqueUsers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
