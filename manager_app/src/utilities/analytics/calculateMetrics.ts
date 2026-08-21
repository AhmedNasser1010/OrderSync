import type { AnalyticsEntry } from "@/lib/types/AnalyticsEntry";

export const calculateMetrics = (data: AnalyticsEntry[]) => {
  const totalRevenue = data.reduce((sum, day) => sum + day.totalRevenue, 0);

  const totalOrders = data.reduce((sum, day) => sum + day.totalOrders, 0);

  const totalCancelled = data.reduce(
    (sum, day) => sum + day.cancelledOrders.totalCancelled,
    0,
  );

  const billableOrders = data.reduce(
    (sum, day) => sum + (day.billableOrders ?? day.totalOrders),
    0,
  );

  const avgOrderValue = billableOrders > 0 ? totalRevenue / billableOrders : 0;

  const cancellationRate =
    totalOrders > 0 ? (totalCancelled / totalOrders) * 100 : 0;

  return {
    totalRevenue,
    totalOrders,
    totalCancelled,
    avgOrderValue,
    cancellationRate,
  };
};
