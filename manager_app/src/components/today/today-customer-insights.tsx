"use client";

import { useTranslations } from "next-intl";
import { Users } from "lucide-react";

interface TodayCustomerInsightsProps {
  customerInsights: {
    totalCustomers: number;
    returningCustomers: number;
    newCustomers: number;
  };
}

export function TodayCustomerInsights({
  customerInsights,
}: TodayCustomerInsightsProps) {
  const t = useTranslations("Dashboard.customerAnalytics");

  const returningPercentage =
    customerInsights.totalCustomers > 0
      ? Number(
          (
            (customerInsights.returningCustomers /
              customerInsights.totalCustomers) *
            100
          ).toFixed(1),
        )
      : 0;

  const newPercentage =
    customerInsights.totalCustomers > 0
      ? Number(
          (
            (customerInsights.newCustomers /
              customerInsights.totalCustomers) *
            100
          ).toFixed(1),
        )
      : 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
      <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
        <Users className="w-4 h-4" />
        {t("title")}
      </h3>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-lg font-bold text-card-foreground">
            {customerInsights.totalCustomers}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {t("totalCustomers")}
          </p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-card-foreground">
            {returningPercentage}%
          </p>
          <p className="text-[10px] text-muted-foreground">
            {t("returningCustomers")}
          </p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-card-foreground">
            {newPercentage}%
          </p>
          <p className="text-[10px] text-muted-foreground">New</p>
        </div>
      </div>
    </div>
  );
}
