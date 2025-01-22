import AverageOrderValue from "./AverageOrderValue";
import CustomerSatisfaction from "./CustomerSatisfaction";
import TotalOrders from "./TotalOrders";
import TotalRevenue from "./TotalRevenue";

export default function KeyMetrics() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <TotalOrders />
      <TotalRevenue />
      <AverageOrderValue />
      <CustomerSatisfaction />
    </div>
  );
}
