"use client";
import AverageOrderValue from "./AverageOrderValue";
import CustomerSatisfaction from "./CustomerSatisfaction";
import TotalOrders from "./TotalOrders";
import TotalRevenue from "./TotalRevenue";

import useAnalytics from "@/hooks/useAnalytics";

export default function KeyMetrics() {
  const { data } = useAnalytics()
  console.log(data)
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <TotalOrders />
      <TotalRevenue />
      <AverageOrderValue />
      <CustomerSatisfaction />
    </div>
  );
}
