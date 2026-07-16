import type { OrderType } from '@ordersync/types';
import type { MainMenuType } from '@ordersync/types';
import getMenuItemsAnalytics from "./getMenuItemsAnalytics";
import getCategoryLevelAnalytics from "./getCategoryLevelAnalytics";

// Helper function to calculate average
function calculateAverage(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length || 0;
}

type MenuItemAnalytics = {
  title: string;
  category: string;
  totalQuantitySold: number;
  totalRevenue: number;
  totalDiscountsSave: number;
};

type CategoryAnalytics = {
  title: string;
  totalQuantitySold: number;
  totalRevenue: number;
  totalDiscountsSave: number;
};

type DaySummary = {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  totalDiscounts: number;
  totalDeliveryFees: number;
  itemsAnalytics: MenuItemAnalytics[];
  categoriesAnalytics: CategoryAnalytics[];
  orderDurations: {
    averagePreparationTime: number;
    averageDeliveryTime: number;
    averageCompletionTime: number;
  };
  customerInsights: {
    totalUniqueCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    averageRating: number;
    feedbackCount: number;
  };
  paymentMethods: Record<string, number>;
  orderSources: Record<string, number>;
  topLocations: {
    address: string;
    latlng: [number, number];
    ordersCount: number;
  }[];
  cancelledOrders: {
    totalCancelled: number;
    cancellationRate: number;
  };
  revenuePerCustomer: {
    highestValueCustomer: {
      name: string;
      totalOrdersValue: number;
      totalOrderCount: number;
    };
    averageOrderValue: number;
  };
};

function extractDaySummary(
  orders: OrderType[],
  menuData: MainMenuType,
  date: string,
): DaySummary {
  let totalOrders = 0;
  let totalRevenue = 0;
  let totalDiscounts = 0;
  let totalDeliveryFees = 0;

  const preparationTimes: number[] = [];
  const deliveryTimes: number[] = [];
  const completionTimes: number[] = [];

  const uniqueCustomers = new Set<string>();
  let newCustomers = 0;
  let returningCustomers = 0;
  let totalRatings = 0;
  let feedbackCount = 0;

  const paymentMethods: Record<string, number> = {};
  const orderSources: Record<string, number> = {};

  const locationCounts: Record<
    string,
    { address: string; latlng: [number, number]; ordersCount: number }
  > = {};
  let totalCancelled = 0;
  let highestValueCustomer = {
    name: "",
    totalOrdersValue: 0,
    totalOrderCount: 0,
  };
  let totalOrderValue = 0;

  for (const order of orders) {
    totalOrders++;
    totalRevenue += order.pricing.total;
    totalDiscounts += order.pricing.discount;
    totalDeliveryFees += order.pricing.deliveryFees;

    // Calculate order durations using timeline fields
    if (order.timeline.preparingAt && order.timeline.placedAt) {
      preparationTimes.push(
        order.timeline.preparingAt - order.timeline.placedAt,
      );
    }
    if (order.timeline.deliveredAt && order.timeline.preparingAt) {
      completionTimes.push(
        order.timeline.deliveredAt - order.timeline.preparingAt,
      );
    }
    if (order.timeline.deliveredAt && order.timeline.placedAt) {
      deliveryTimes.push(
        order.timeline.deliveredAt - order.timeline.placedAt,
      );
    }

    // Customer Insights
    if (!uniqueCustomers.has(order.customer.uid)) {
      uniqueCustomers.add(order.customer.uid);
      if (order.customer.totalOrders === 1) {
        newCustomers++;
      } else {
        returningCustomers++;
      }
    }
    if (order.customerFeedback?.rating) {
      totalRatings += order.customerFeedback.rating;
      feedbackCount++;
    }

    // Payment Methods
    if (!paymentMethods[order.payment.method]) {
      paymentMethods[order.payment.method] = 0;
    }
    paymentMethods[order.payment.method]++;

    // Order Sources
    if (!orderSources[order.metadata.orderSource]) {
      orderSources[order.metadata.orderSource] = 0;
    }
    orderSources[order.metadata.orderSource]++;

    // Location Counts
    const locationKey = `${order.delivery.address}:${order.delivery.latlng.join(
      ",",
    )}`;
    if (!locationCounts[locationKey]) {
      locationCounts[locationKey] = {
        address: order.delivery.address,
        latlng: order.delivery.latlng,
        ordersCount: 0,
      };
    }
    locationCounts[locationKey].ordersCount++;

    // Cancelled Orders
    if (order.metadata.cancelAutoAssign) {
      totalCancelled++;
    }

    // Highest Value Customer
    if (
      order.customer.totalOrdersValue > highestValueCustomer.totalOrdersValue
    ) {
      highestValueCustomer = {
        name: order.customer.name,
        totalOrdersValue: order.customer.totalOrdersValue,
        totalOrderCount: order.customer.totalOrders,
      };
    }

    // Total Order Value for Average Calculation
    totalOrderValue += order.pricing.total;
  }

  // Summarize Data
  const averageOrderValue = totalOrders > 0 ? Number((totalOrderValue / totalOrders).toFixed(2)) : 0;
  const cancellationRate = totalOrders > 0 ? (totalCancelled / totalOrders) * 100 : 0;

  // Convert locationCounts to an array and sort by ordersCount
  const topLocations = Object.values(locationCounts).sort(
    (a, b) => b.ordersCount - a.ordersCount,
  );

  const itemsAnalytics = getMenuItemsAnalytics(orders, menuData.items);
  const categoriesAnalytics = getCategoryLevelAnalytics(
    orders,
    menuData.items,
    menuData.categories,
  );

  return {
    date,
    totalOrders,
    totalRevenue,
    totalDiscounts,
    totalDeliveryFees,
    itemsAnalytics,
    categoriesAnalytics,
    orderDurations: {
      averagePreparationTime: calculateAverage(preparationTimes),
      averageDeliveryTime: calculateAverage(deliveryTimes),
      averageCompletionTime: calculateAverage(completionTimes),
    },
    customerInsights: {
      totalUniqueCustomers: uniqueCustomers.size,
      newCustomers,
      returningCustomers,
      averageRating: feedbackCount > 0 ? totalRatings / feedbackCount : 0,
      feedbackCount,
    },
    paymentMethods,
    orderSources,
    topLocations,
    cancelledOrders: {
      totalCancelled,
      cancellationRate,
    },
    revenuePerCustomer: {
      highestValueCustomer,
      averageOrderValue,
    },
  };
}

export default extractDaySummary;
