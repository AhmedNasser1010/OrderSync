import KeyMetrics from "@/components/key_metrics/KeyMetrics";
import RevenueBreakdown from "@/components/analytics_cards/RevenueBreakdown";
import RevenueTrend from "@/components/analytics_cards/RevenueTrend";
import TopSellingItems from "@/components/analytics_cards/TopSellingItems";
import OrderSources from "@/components/analytics_cards/OrderSources";
import OrderDurations from "@/components/analytics_cards/OrderDurations";
import Cancellations from "@/components/analytics_cards/Cancellations";
import TopLocations from "@/components/analytics_cards/TopLocations";
import CustomerTypes from "@/components/analytics_cards/CustomerTypes";

export default function Component() {
  return (
    <div className="space-y-4">
      <div className="border-t"></div>
      <KeyMetrics />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <RevenueBreakdown />
        <RevenueTrend />
        <TopSellingItems />
        <OrderSources />
        <OrderDurations />
        <Cancellations />
        <TopLocations />
        <CustomerTypes />
      </div>
    </div>
  );
}
