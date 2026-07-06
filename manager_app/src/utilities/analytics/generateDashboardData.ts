import type { AnalyticsEntry } from "@/lib/types/AnalyticsEntry";
import type {
  DashboardData,
  KPIData,
  OperationMetrics,
  StatusType,
} from "@/lib/types/types";
import { getGrowthPercentage } from "./getGrowthPercentage";

export const generateDashboardData = ({
  currentPeriodData,
  previousPeriodData,
  kpis,
}: {
  currentPeriodData: AnalyticsEntry[];
  previousPeriodData: AnalyticsEntry[];
  kpis: KPIData[];
}): DashboardData => {
  if (!currentPeriodData.length) {
    return {
      kpis: [],
      salesTrends: [],
      topItems: [],
      categories: [],
      customerAnalytics: {
        totalCustomers: 0,
        returningCustomers: 0,
        newCustomers: 0,
        feedbackCount: 0,
        averageRating: 0,
        returningPercentage: 0,
        newPercentage: 0,
        topCustomer: {
          name: "N/A",
          totalOrderCount: 0,
          totalOrdersValue: 0,
        },
      },
      operations: [],
      deliveryAreas: [],
      paymentMethods: [],
      orderSources: [],
      aiInsights: [],
      businessHealth: {
        score: 0,
        maxScore: 100,
        strengths: [],
        alerts: [],
        trends: [],
      },
      dateRange: "N/A",
    };
  }

  // --------------------
  // Sales Trends
  // --------------------

  const salesTrends = currentPeriodData.map((day) => ({
    date: day.date,
    revenue: day.totalRevenue,
    orders: day.totalOrders,
  }));

  // --------------------
  // Top Items
  // --------------------

  const currentItemsMap = new Map<
    string,
    {
      quantity: number;
      revenue: number;
    }
  >();

  currentPeriodData.forEach((day) => {
    day.itemsAnalytics.forEach((item) => {
      const existing = currentItemsMap.get(item.title);

      currentItemsMap.set(item.title, {
        quantity: (existing?.quantity ?? 0) + item.totalQuantitySold,

        revenue: (existing?.revenue ?? 0) + item.totalRevenue,
      });
    });
  });

  const previousItemsMap = new Map<
    string,
    {
      quantity: number;
      revenue: number;
    }
  >();

  previousPeriodData.forEach((day) => {
    day.itemsAnalytics.forEach((item) => {
      const existing = previousItemsMap.get(item.title);

      previousItemsMap.set(item.title, {
        quantity: (existing?.quantity ?? 0) + item.totalQuantitySold,

        revenue: (existing?.revenue ?? 0) + item.totalRevenue,
      });
    });
  });

  const topItems = [...currentItemsMap.entries()]
    .map(([name, current]) => {
      const previous = previousItemsMap.get(name);

      const growth =
        previous?.quantity && previous.quantity > 0
          ? Number(
              (
                ((current.quantity - previous.quantity) / previous.quantity) *
                100
              ).toFixed(1),
            )
          : current.quantity > 0
            ? 100
            : 0;

      return {
        name,
        quantity: current.quantity,
        revenue: current.revenue,
        growth,
      };
    })
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)
    .map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

  // --------------------
  // Categories
  // --------------------

  const categoriesMap = new Map<
    string,
    {
      revenue: number;
    }
  >();

  currentPeriodData.forEach((day) => {
    day.categoriesAnalytics.forEach((category) => {
      const existing = categoriesMap.get(category.title);

      categoriesMap.set(category.title, {
        revenue: (existing?.revenue ?? 0) + category.totalRevenue,
      });
    });
  });

  const totalCategoryRevenue = [...categoriesMap.values()].reduce(
    (sum, category) => sum + category.revenue,
    0,
  );

  const categories = [...categoriesMap.entries()]
    .map(([name, values]) => {
      const percentage =
        totalCategoryRevenue > 0
          ? Number(((values.revenue / totalCategoryRevenue) * 100).toFixed(1))
          : 0;

      const status: StatusType =
        percentage >= 40 ? "good" : percentage >= 15 ? "warning" : "alert";

      return {
        name,
        revenue: values.revenue,
        percentage,
        status,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const [startDate, endDate] = currentPeriodData
    .map((day) => day.date)
    .sort((a, b) => a.localeCompare(b));

  const dateRange = startDate
    ? startDate === endDate
      ? startDate
      : `${startDate} - ${endDate}`
    : "N/A";

  // --------------------
  // Customers
  // --------------------

  const totalCustomers = currentPeriodData.reduce(
    (sum, day) => sum + day.customerInsights.totalUniqueCustomers,
    0,
  );

  const returningCustomers = currentPeriodData.reduce(
    (sum, day) => sum + day.customerInsights.returningCustomers,
    0,
  );

  const newCustomers = currentPeriodData.reduce(
    (sum, day) => sum + day.customerInsights.newCustomers,
    0,
  );

  const feedbackCount = currentPeriodData.reduce(
    (sum, day) => sum + day.customerInsights.feedbackCount,
    0,
  );

  const averageRating =
    currentPeriodData.reduce(
      (sum, day) => sum + day.customerInsights.averageRating,
      0,
    ) / currentPeriodData.length;

  const latestHighestValueCustomer =
    currentPeriodData[currentPeriodData.length - 1]?.revenuePerCustomer
      .highestValueCustomer;

  const customerAnalytics = {
    totalCustomers,
    returningCustomers,
    newCustomers,
    feedbackCount,
    averageRating: Number(averageRating.toFixed(1)),
    returningPercentage:
      totalCustomers > 0
        ? Number(((returningCustomers / totalCustomers) * 100).toFixed(1))
        : 0,
    newPercentage:
      totalCustomers > 0
        ? Number(((newCustomers / totalCustomers) * 100).toFixed(1))
        : 0,
    topCustomer: latestHighestValueCustomer ?? {
      name: "N/A",
      totalOrderCount: 0,
      totalOrdersValue: 0,
    },
  };

  // --------------------
  // Operations
  // --------------------

  const avgPreparationTime =
    currentPeriodData.reduce(
      (sum, day) => sum + day.orderDurations.averagePreparationTime,
      0,
    ) / currentPeriodData.length;

  const avgDeliveryTime =
    currentPeriodData.reduce(
      (sum, day) => sum + day.orderDurations.averageDeliveryTime,
      0,
    ) / currentPeriodData.length;

  const prepMinutes = Math.round(avgPreparationTime / 60000);

  const deliveryMinutes = Math.round(avgDeliveryTime / 60000);

  const totalOrders = currentPeriodData.reduce(
    (sum, day) => sum + day.totalOrders,
    0,
  );

  const totalCancelled = currentPeriodData.reduce(
    (sum, day) => sum + day.cancelledOrders.totalCancelled,
    0,
  );

  const completionRate =
    totalOrders > 0
      ? Number(
          (((totalOrders - totalCancelled) / totalOrders) * 100).toFixed(1),
        )
      : 0;

  const operations: OperationMetrics[] = [
    {
      label: "Avg Prep Time",
      time: `${prepMinutes} min`,
      status:
        prepMinutes <= 15 ? "good" : prepMinutes <= 25 ? "warning" : "alert",
      benchmark: "vs 15 min avg",
    },

    {
      label: "Avg Delivery Time",
      time: `${deliveryMinutes} min`,
      status:
        deliveryMinutes <= 35
          ? "good"
          : deliveryMinutes <= 50
            ? "warning"
            : "alert",
      benchmark: "vs 35 min avg",
    },

    {
      label: "Order Completion",
      time: `${completionRate}%`,
      status:
        completionRate >= 97
          ? "good"
          : completionRate >= 90
            ? "warning"
            : "alert",
      benchmark: "vs 97% target",
    },
  ];

  // --------------------
  // Delivery Areas
  // --------------------

  const deliveryMap = new Map<string, number>();

  let totalAreaOrders = 0;

  currentPeriodData.forEach((day) => {
    day.topLocations.forEach((location) => {
      totalAreaOrders += location.ordersCount;

      deliveryMap.set(
        location.address,
        (deliveryMap.get(location.address) ?? 0) + location.ordersCount,
      );
    });
  });

  const deliveryAreas = [...deliveryMap.entries()]
    .map(([location, orders]) => ({
      location,
      orders,
      percentage:
        totalAreaOrders > 0
          ? Number(((orders / totalAreaOrders) * 100).toFixed(1))
          : 0,
    }))
    .sort((a, b) => b.orders - a.orders);

  // --------------------
  // Payment Methods
  // --------------------

  const paymentMap = new Map<string, number>();

  let totalPaymentOrders = 0;

  currentPeriodData.forEach((day) => {
    Object.entries(day.paymentMethods).forEach(([method, count]) => {
      totalPaymentOrders += count;

      paymentMap.set(method, (paymentMap.get(method) ?? 0) + count);
    });
  });

  const paymentMethods = [...paymentMap.entries()].map(([name, orders]) => ({
    name,
    orders,
    percentage:
      totalPaymentOrders > 0
        ? Number(((orders / totalPaymentOrders) * 100).toFixed(1))
        : 0,
  }));

  const orderSourceMap = new Map<string, number>();
  let totalSourceOrders = 0;

  currentPeriodData.forEach((day) => {
    Object.entries(day.orderSources).forEach(([source, count]) => {
      totalSourceOrders += count;
      orderSourceMap.set(source, (orderSourceMap.get(source) ?? 0) + count);
    });
  });

  const orderSources = [...orderSourceMap.entries()]
    .map(([name, orders]) => {
      const percentage =
        totalSourceOrders > 0
          ? Number(((orders / totalSourceOrders) * 100).toFixed(1))
          : 0;

      const status: StatusType =
        percentage >= 40 ? "good" : percentage >= 15 ? "warning" : "alert";

      return {
        name,
        orders,
        percentage,
        status,
      };
    })
    .sort((a, b) => b.orders - a.orders);

  // --------------------
  // AI Insights
  // --------------------

  const aiInsights: string[] = [];

  if (topItems.length > 0) {
    aiInsights.push(`${topItems[0].name} is currently the best-selling item.`);
  }

  if (customerAnalytics.returningPercentage > 50) {
    aiInsights.push(
      `Strong customer retention at ${customerAnalytics.returningPercentage}%.`,
    );
  }

  const topCategory = categories[0];

  if (topCategory) {
    aiInsights.push(
      `${topCategory.name} generates ${topCategory.percentage}% of total revenue.`,
    );
  }

  // --------------------
  // Business Health
  // --------------------

  const currentRevenue = currentPeriodData.reduce(
    (sum, day) => sum + day.totalRevenue,
    0,
  );

  const previousRevenue = previousPeriodData.reduce(
    (sum, day) => sum + day.totalRevenue,
    0,
  );

  const previousCustomers = previousPeriodData.reduce(
    (sum, day) => sum + day.customerInsights.totalUniqueCustomers,
    0,
  );

  const revenueGrowth = getGrowthPercentage(currentRevenue, previousRevenue);

  const customerGrowth = getGrowthPercentage(totalCustomers, previousCustomers);

  const efficiencyScore = prepMinutes <= 15 ? 100 : prepMinutes <= 25 ? 70 : 40;

  let score = 0;

  // Revenue Growth (20)
  if (revenueGrowth >= 15) score += 20;
  else if (revenueGrowth >= 5) score += 15;
  else if (revenueGrowth >= 0) score += 10;

  // Customer Growth (20)
  if (customerGrowth >= 15) score += 20;
  else if (customerGrowth >= 5) score += 15;
  else if (customerGrowth >= 0) score += 10;

  // Retention (20)
  if (customerAnalytics.returningPercentage >= 60) score += 20;
  else if (customerAnalytics.returningPercentage >= 40) score += 15;
  else if (customerAnalytics.returningPercentage >= 20) score += 10;

  // Completion Rate (20)
  if (completionRate >= 97) score += 20;
  else if (completionRate >= 92) score += 15;
  else if (completionRate >= 85) score += 10;

  // Efficiency (20)
  if (efficiencyScore >= 90) score += 20;
  else if (efficiencyScore >= 70) score += 15;
  else score += 10;

  const strengths: string[] = [];
  const alerts: string[] = [];

  // Strengths

  if (customerAnalytics.returningPercentage >= 50) {
    strengths.push(
      `Strong customer retention (${customerAnalytics.returningPercentage}% repeat customers)`,
    );
  }

  if (completionRate >= 97) {
    strengths.push(`Excellent order completion rate (${completionRate}%)`);
  }

  if (prepMinutes <= 15) {
    strengths.push(`Fast preparation time (${prepMinutes} min average)`);
  }

  if (revenueGrowth > 10) {
    strengths.push(
      `Revenue increased by ${revenueGrowth}% compared to previous period`,
    );
  }

  // Alerts

  if (customerAnalytics.returningPercentage < 30) {
    alerts.push("Low customer retention rate. Consider loyalty programs.");
  }

  if (completionRate < 90) {
    alerts.push("Order completion rate is below target.");
  }

  if (prepMinutes > 25) {
    alerts.push("Preparation time is slower than expected.");
  }

  const weakestCategory = categories[categories.length - 1];

  if (weakestCategory && weakestCategory.percentage < 10) {
    alerts.push(
      `${weakestCategory.name} contributes only ${weakestCategory.percentage}% of revenue.`,
    );
  }

  const trends = [
    {
      label: "Revenue Growth",
      change: revenueGrowth,
      status:
        revenueGrowth >= 0 ? ("good" as StatusType) : ("alert" as StatusType),
    },

    {
      label: "Customer Growth",
      change: customerGrowth,
      status:
        customerGrowth >= 0 ? ("good" as StatusType) : ("alert" as StatusType),
    },

    {
      label: "Efficiency",
      change: prepMinutes <= 15 ? 10 : prepMinutes <= 25 ? 0 : -10,
      status:
        prepMinutes <= 15
          ? ("good" as StatusType)
          : prepMinutes <= 25
            ? ("warning" as StatusType)
            : ("alert" as StatusType),
    },
  ];

  const businessHealth = {
    score,
    maxScore: 100,
    strengths,
    alerts,
    trends,
  };

  return {
    dateRange,
    kpis,
    salesTrends,
    topItems,
    categories,
    customerAnalytics,
    operations,
    deliveryAreas,
    paymentMethods,
    orderSources,
    aiInsights,
    businessHealth,
  };
};
