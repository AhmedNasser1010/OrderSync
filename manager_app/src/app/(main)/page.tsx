"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { InsightsCard } from "@/components/dashboard/insights-card";
import { SalesTrends } from "@/components/dashboard/sales-trends";
import { TopItems } from "@/components/dashboard/top-items";
import { CategoryPerf } from "@/components/dashboard/category-perf";
import { CustomerAnalytics } from "@/components/dashboard/customer-analytics";
import { OperationsPerf } from "@/components/dashboard/operations-perf";
import { DeliveryAreas } from "@/components/dashboard/delivery-areas";
import { PaymentMethods } from "@/components/dashboard/payment-methods";
import { BusinessScore } from "@/components/dashboard/business-score";
import useAnalytics from "@/hooks/useAnalytics";

export default function Component() {
  const { dashboardData } = useAnalytics();
  console.log(dashboardData);

  return (
    <main className="bg-background min-h-screen flex flex-col w-full">
      <DashboardHeader />

      <div className="flex-1 overflow-y-auto pb-24">
        <KPICards kpis={dashboardData.kpis} />
        <InsightsCard insights={dashboardData.aiInsights} />
        <SalesTrends data={dashboardData.salesTrends} />
        <TopItems items={dashboardData.topItems} />
        <CategoryPerf categories={dashboardData.categories} />
        <CustomerAnalytics data={dashboardData.customerAnalytics} />
        <OperationsPerf metrics={dashboardData.operations} />
        <DeliveryAreas areas={dashboardData.deliveryAreas} />
        <PaymentMethods methods={dashboardData.paymentMethods} />
        <BusinessScore data={dashboardData.businessHealth} />
      </div>
    </main>
  );
}
