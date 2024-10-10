import { OrderType } from "@/types/order";
import { MainMenuType } from "@/types/menu";
import getMenuItemsAnalytics from './getMenuItemsAnalytics'
import getCategoryLevelAnalytics from './getCategoryLevelAnalytics'

// Helper function to calculate average
function calculateAverage(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length || 0;
}

type MenuItemAnalytics = {
  title: string;
  category: string;
  totalQuantitySold: number;
  totalRevenue: number;
  totalDiscountsSave: number
};

type CategoryAnalytics = {
  title: string;
  totalQuantitySold: number;
  totalRevenue: number;
  totalDiscountsSave: number;
}

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
    highestValueCustomer: { name: string; totalOrdersValue: number };
    averageOrderValue: number;
  };
};

function extractDaySummary(
  orders: OrderType[],
  menuData: MainMenuType,
  date: string
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
  let highestValueCustomer = { name: "", totalOrdersValue: 0 };
  let totalOrderValue = 0;

  for (const order of orders) {
    totalOrders++;
    totalRevenue += order.cartTotalPrice.total;
    totalDiscounts += order.cartTotalPrice.discount;
    totalDeliveryFees += order.deliveryFees;

    // Calculate order durations
    if (order.orderTimestamps.preparedAt && order.orderTimestamps.placedAt) {
      preparationTimes.push(
        order.orderTimestamps.preparedAt - order.orderTimestamps.placedAt
      );
    }
    if (order.orderTimestamps.completedAt && order.orderTimestamps.preparedAt) {
      completionTimes.push(
        order.orderTimestamps.completedAt - order.orderTimestamps.preparedAt
      );
    }
    if (order.orderTimestamps.completedAt && order.orderTimestamps.placedAt) {
      deliveryTimes.push(
        order.orderTimestamps.completedAt - order.orderTimestamps.placedAt
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
    if (order.customerFeedback.rating !== null) {
      totalRatings += order.customerFeedback.rating;
      feedbackCount++;
    }

    // Payment Methods
    if (!paymentMethods[order.payment.method]) {
      paymentMethods[order.payment.method] = 0;
    }
    paymentMethods[order.payment.method]++;

    // Order Sources
    if (!orderSources[order.orderSource]) {
      orderSources[order.orderSource] = 0;
    }
    orderSources[order.orderSource]++;

    // Location Counts
    const locationKey = `${order.location.address}:${order.location.latlng.join(
      ","
    )}`;
    if (!locationCounts[locationKey]) {
      locationCounts[locationKey] = {
        address: order.location.address,
        latlng: order.location.latlng,
        ordersCount: 0,
      };
    }
    locationCounts[locationKey].ordersCount++;

    // Cancelled Orders
    if (order.cancelAutoAssign) {
      totalCancelled++;
    }

    // Highest Value Customer
    if (
      order.customer.totalOrdersValue > highestValueCustomer.totalOrdersValue
    ) {
      highestValueCustomer = {
        name: order.customer.name,
        totalOrdersValue: order.customer.totalOrdersValue,
      };
    }

    // Total Order Value for Average Calculation
    totalOrderValue += order.cartTotalPrice.total;
  }

  // Summarize Data
  const averageOrderValue = Number((totalOrderValue / totalOrders).toFixed(2));
  const cancellationRate = (totalCancelled / totalOrders) * 100;

  // Convert locationCounts to an array and sort by ordersCount
  const topLocations = Object.values(locationCounts).sort(
    (a, b) => b.ordersCount - a.ordersCount
  );

  const itemsAnalytics = getMenuItemsAnalytics(orders, menuData.items)
  const categoriesAnalytics = getCategoryLevelAnalytics(orders, menuData.items, menuData.categories)

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









// import { OrderType } from "@/types/order";
// import { MainMenuType } from "@/types/menu";
// import { DaySummaryType } from "@/lib/data_extract/types";
// import calcOrderDurations from "./calcOrderDurations";
// import getCustomerInsights from "./getCustomerInsights";
// import getPaymentMethods from "./getPaymentMethods";
// import getOrderSources from "./getOrderSources";
// import getLocationCounts from "./getLocationCounts";
// import getHighestValueCustomer from "./getHighestValueCustomer";
// import getMenuItemsAnalytics from "./getMenuItemsAnalytics";

// type MenuItemAnalytics = {
//   id: string;
//   name: string;
//   quantitySold: number;
//   totalRevenue: number;
//   totalDiscounts: number;
// };

// type DaySummary = {
//   date: string;
//   totalOrders: number;
//   totalRevenue: number;
//   totalDiscounts: number;
//   totalDeliveryFees: number;
//   menuItemAnalytics: MenuItemAnalytics[];
//   orderDurations: {
//     averagePreparationTime: number;
//     averageDeliveryTime: number;
//     averageCompletionTime: number;
//   };
//   customerInsights: {
//     totalUniqueCustomers: number;
//     newCustomers: number;
//     returningCustomers: number;
//     averageRating: number;
//     feedbackCount: number;
//   };
//   paymentMethods: Record<string, number>;
//   orderSources: Record<string, number>;
//   topLocations: {
//     address: string;
//     latlng: [number, number];
//     ordersCount: number;
//   }[];
//   cancelledOrders: {
//     totalCancelled: number;
//     cancellationRate: number;
//   };
//   revenuePerCustomer: {
//     highestValueCustomer: { name: string; totalOrdersValue: number };
//     averageOrderValue: number;
//   };
// };

// function extractDaySummary(
//   orders: OrderType[],
//   menu: MainMenuType,
//   date: string
// ): DaySummary {
//   // Initialize data to accumulate values
//   const initData = {
//     totalOrders: 0,
//     totalRevenue: 0,
//     totalDiscounts: 0,
//     totalDeliveryFees: 0,
//     totalCancelled: 0,
//     totalOrderValue: 0,
//     orderDurations: {
//       averagePreparationTime: 0,
//       averageDeliveryTime: 0,
//       averageCompletionTime: 0,
//     },
//     customerInsights: {
//       totalUniqueCustomers: 0,
//       newCustomers: 0,
//       returningCustomers: 0,
//       averageRating: 0,
//       feedbackCount: 0,
//     },
//     paymentMethods: {} as Record<string, number>,
//     orderSources: {} as Record<string, number>,
//     topLocations: [] as {
//       address: string;
//       latlng: [number, number];
//       ordersCount: number;
//     }[],
//     highestValueCustomer: {
//       name: "",
//       totalOrdersValue: 0,
//     },
//     menuItemAnalytics: [] as MenuItemAnalytics[],
//   };

//   // Accumulate data from each order
//   for (const order of orders) {
//     initData.totalOrders++;
//     initData.totalRevenue += order.cartTotalPrice.total;
//     initData.totalDiscounts += order.cartTotalPrice.discount;
//     initData.totalDeliveryFees += order.deliveryFees;
//     initData.totalOrderValue += order.cartTotalPrice.total;

//     if (order.status.current === "CANCELED") initData.totalCancelled++;

//     // Update order durations
//     const durations = calcOrderDurations(order);
//     initData.orderDurations.averagePreparationTime += durations.averagePreparationTime;
//     initData.orderDurations.averageDeliveryTime += durations.averageDeliveryTime;
//     initData.orderDurations.averageCompletionTime += durations.averageCompletionTime;

//     // Update customer insights
//     const insights = getCustomerInsights(order);
//     initData.customerInsights.totalUniqueCustomers += insights.totalUniqueCustomers;
//     initData.customerInsights.newCustomers += insights.newCustomers;
//     initData.customerInsights.returningCustomers += insights.returningCustomers;
//     initData.customerInsights.averageRating += insights.averageRating;
//     initData.customerInsights.feedbackCount += insights.feedbackCount;

//     // Update payment methods and order sources
//     const paymentMethods = getPaymentMethods(order);
//     for (const [method, count] of Object.entries(paymentMethods)) {
//       initData.paymentMethods[method] = (initData.paymentMethods[method] || 0) + count;
//     }

//     const orderSources = getOrderSources(order);
//     for (const [source, count] of Object.entries(orderSources)) {
//       initData.orderSources[source] = (initData.orderSources[source] || 0) + count;
//     }
//   }

//   // Calculate averages
//   initData.orderDurations.averagePreparationTime /= initData.totalOrders;
//   initData.orderDurations.averageDeliveryTime /= initData.totalOrders;
//   initData.orderDurations.averageCompletionTime /= initData.totalOrders;

//   initData.customerInsights.averageRating /= initData.totalOrders;

//   // Get the highest value customer
//   initData.highestValueCustomer = getHighestValueCustomer(orders);

//   // Get location counts and sort them by the number of orders
//   const locationCounts = getLocationCounts(orders);
//   initData.topLocations = Object.values(locationCounts).sort(
//     (a, b) => b.ordersCount - a.ordersCount
//   );

//   // Get menu item analytics
//   initData.menuItemAnalytics = getMenuItemsAnalytics(orders);

//   // Calculate the average order value and cancellation rate
//   const averageOrderValue = initData.totalOrderValue / initData.totalOrders;
//   const cancellationRate = (initData.totalCancelled / initData.totalOrders) * 100;

//   return {
//     date,
//     totalOrders: initData.totalOrders,
//     totalRevenue: initData.totalRevenue,
//     totalDiscounts: initData.totalDiscounts,
//     totalDeliveryFees: initData.totalDeliveryFees,
//     menuItemAnalytics: initData.menuItemAnalytics,
//     orderDurations: initData.orderDurations,
//     customerInsights: initData.customerInsights,
//     paymentMethods: initData.paymentMethods,
//     orderSources: initData.orderSources,
//     topLocations: initData.topLocations,
//     cancelledOrders: {
//       totalCancelled: initData.totalCancelled,
//       cancellationRate,
//     },
//     revenuePerCustomer: {
//       highestValueCustomer: initData.highestValueCustomer,
//       averageOrderValue,
//     },
//   };
// }

// export default extractDaySummary;
