"use client";

import { useTranslations } from "next-intl";
import { Calendar } from "lucide-react";
import { AppHeader } from "@/components/dashboard/app-header";
import { TodayKPICards } from "@/components/today/today-kpi-cards";
import { TodayBalanceCard } from "@/components/today/today-balance-card";
import { TodayActiveOrders } from "@/components/today/today-active-orders";
import { TodayStatusBreakdown } from "@/components/today/today-status-breakdown";
// import { TodayPaymentMethods } from "@/components/today/today-payment-methods";
import { TodayTopItems } from "@/components/today/today-top-items";
import { TodayCustomerInsights } from "@/components/today/today-customer-insights";
import useTodayOrders from "@/hooks/useTodayOrders";
import { TodaySkeleton } from "@/components/today/today-skeleton";
import NoData from "@/components/dashboard/no-data";

export default function TodayPage() {
  const { todayData, loading, hasData } = useTodayOrders();
  const t = useTranslations("Dashboard.today");

  return (
    <main className="min-h-screen flex flex-col w-full">
      <AppHeader
        title={t("title")}
        subtitle={t("welcome")}
        icon={<Calendar className="w-5 h-5" />}
      />

      <div className="flex-1 px-0 pt-6 pb-24 max-w-5xl mx-auto w-full space-y-2">
        {loading ? (
          <TodaySkeleton />
        ) : !hasData ? (
          <NoData title={t("noData.title")} description={t("noData.description")} />
        ) : (
          <>
            <TodayKPICards data={todayData} />
            <TodayBalanceCard balance={todayData.balance} />
            <TodayActiveOrders activeOrders={todayData.activeOrders} />
            <TodayStatusBreakdown
              statusBreakdown={todayData.statusBreakdown}
            />
            {/* <TodayPaymentMethods methods={todayData.paymentMethods} /> */}
            <TodayTopItems items={todayData.topItems} />
            <TodayCustomerInsights
              customerInsights={todayData.customerInsights}
            />
          </>
        )}
      </div>
    </main>
  );
}
