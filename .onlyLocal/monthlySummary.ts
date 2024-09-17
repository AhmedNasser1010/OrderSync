type DaySummarize = {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  totalDiscounts: number;
  totalDeliveryFees: number;
  averageOrderValue: number;
  paymentMethods: Record<string, number>;
  customerLocations: {
    mostFrequent: {
      area: string;
      coordinates: [number, number];
      totalOrders: number;
    };
    topDeliveryAreas: Array<{
      area: string;
      totalOrders: number;
    }>;
  };
  topSellingItems: Array<{
    itemId: string;
    itemName: string;
    quantitySold: number;
  }>;
  peakOrderTime: string;
  averageOrderProcessingTime: string;
  orderStatusDistribution: Record<string, number>;
  discountCodeUsage: Record<string, number>;
  operationalEfficiency: {
    averageCookingTime: string;
    averageDeliveryTime: string;
  };
  customerFeedback: {
    comments: number;
    averageRating: number;
  };
};

type MonthlySummarize = {
  month: string;
  totalOrders: number;
  totalRevenue: number;
  totalDiscounts: number;
  totalDeliveryFees: number;
  averageOrderValue: number;
  paymentMethods: Record<string, number>;
  customerLocations: {
    mostFrequent: {
      area: string;
      coordinates: [number, number];
      totalOrders: number;
    };
    topDeliveryAreas: Array<{
      area: string;
      totalOrders: number;
    }>;
  };
  topSellingItems: Array<{
    itemId: string;
    itemName: string;
    quantitySold: number;
  }>;
  peakOrderTime: string;
  averageOrderProcessingTime: string;
  orderStatusDistribution: Record<string, number>;
  discountCodeUsage: Record<string, number>;
  operationalEfficiency: {
    averageCookingTime: string;
    averageDeliveryTime: string;
  };
  customerFeedback: {
    comments: number;
    averageRating: number;
  };
};

function extractMonthlySummary(dailySummaries: DaySummarize[]): MonthlySummarize {
  const firstDay = dailySummaries[0].date.split("-").slice(0, 2).join("-");

  let totalOrders = 0;
  let totalRevenue = 0;
  let totalDiscounts = 0;
  let totalDeliveryFees = 0;
  let totalFeedbackComments = 0;
  let totalFeedbackRating = 0;
  let totalDaysWithFeedback = 0;

  const paymentMethods: Record<string, number> = {};
  const orderStatusDistribution: Record<string, number> = {};
  const discountCodeUsage: Record<string, number> = {};
  const topSellingItems: Record<string, { itemName: string; quantitySold: number }> = {};
  const topDeliveryAreas: Record<string, { totalOrders: number; coordinates?: [number, number] }> = {};

  let totalProcessingTimes = 0;
  let totalCookingTimes = 0;
  let totalDeliveryTimes = 0;
  let processingTimeCount = 0;
  let cookingTimeCount = 0;
  let deliveryTimeCount = 0;

  dailySummaries.forEach((day) => {
    // Aggregate basic totals
    totalOrders += day.totalOrders;
    totalRevenue += day.totalRevenue;
    totalDiscounts += day.totalDiscounts;
    totalDeliveryFees += day.totalDeliveryFees;

    // Aggregate payment methods
    Object.entries(day.paymentMethods).forEach(([method, count]) => {
      paymentMethods[method] = (paymentMethods[method] || 0) + count;
    });

    // Aggregate order statuses
    Object.entries(day.orderStatusDistribution).forEach(([status, count]) => {
      orderStatusDistribution[status] = (orderStatusDistribution[status] || 0) + count;
    });

    // Aggregate discount code usage
    Object.entries(day.discountCodeUsage).forEach(([code, count]) => {
      discountCodeUsage[code] = (discountCodeUsage[code] || 0) + count;
    });

    // Aggregate top selling items
    day.topSellingItems.forEach((item) => {
      if (!topSellingItems[item.itemId]) {
        topSellingItems[item.itemId] = { itemName: item.itemName, quantitySold: 0 };
      }
      topSellingItems[item.itemId].quantitySold += item.quantitySold;
    });

    // Aggregate delivery areas
    day.customerLocations.topDeliveryAreas.forEach((area) => {
      if (!topDeliveryAreas[area.area]) {
        topDeliveryAreas[area.area] = { totalOrders: 0 };
      }
      topDeliveryAreas[area.area].totalOrders += area.totalOrders;
    });

    // Update most frequent delivery area
    const mostFrequentArea = day.customerLocations.mostFrequent;
    if (!topDeliveryAreas[mostFrequentArea.area]) {
      topDeliveryAreas[mostFrequentArea.area] = { totalOrders: 0, coordinates: mostFrequentArea.coordinates };
    }
    topDeliveryAreas[mostFrequentArea.area].totalOrders += mostFrequentArea.totalOrders;

    // Aggregate feedback
    if (day.customerFeedback.comments > 0) {
      totalFeedbackComments += day.customerFeedback.comments;
      totalFeedbackRating += day.customerFeedback.averageRating;
      totalDaysWithFeedback++;
    }

    // Aggregate operational times
    const processingTime = parseInt(day.averageOrderProcessingTime);
    const cookingTime = parseInt(day.operationalEfficiency.averageCookingTime);
    const deliveryTime = parseInt(day.operationalEfficiency.averageDeliveryTime);

    if (!isNaN(processingTime)) {
      totalProcessingTimes += processingTime;
      processingTimeCount++;
    }

    if (!isNaN(cookingTime)) {
      totalCookingTimes += cookingTime;
      cookingTimeCount++;
    }

    if (!isNaN(deliveryTime)) {
      totalDeliveryTimes += deliveryTime;
      deliveryTimeCount++;
    }
  });

  // Calculate monthly averages
  const averageOrderValue = totalRevenue / totalOrders;
  const averageOrderProcessingTime = (totalProcessingTimes / processingTimeCount).toFixed(0) + " minutes";
  const averageCookingTime = (totalCookingTimes / cookingTimeCount).toFixed(0) + " minutes";
  const averageDeliveryTime = (totalDeliveryTimes / deliveryTimeCount).toFixed(0) + " minutes";
  const averageFeedbackRating = (totalFeedbackRating / totalDaysWithFeedback).toFixed(1);

  // Convert top selling items and top delivery areas into arrays
  const topSellingItemsArray = Object.entries(topSellingItems).map(([itemId, itemData]) => ({
    itemId,
    itemName: itemData.itemName,
    quantitySold: itemData.quantitySold,
  }));

  const topDeliveryAreasArray = Object.entries(topDeliveryAreas).map(([area, data]) => ({
    area,
    totalOrders: data.totalOrders,
  }));

  // Return the monthly summary
  return {
    month: firstDay,
    totalOrders,
    totalRevenue,
    totalDiscounts,
    totalDeliveryFees,
    averageOrderValue,
    paymentMethods,
    customerLocations: {
      mostFrequent: {
        area: Object.keys(topDeliveryAreas).reduce((a, b) => (topDeliveryAreas[a].totalOrders > topDeliveryAreas[b].totalOrders ? a : b)),
        coordinates: topDeliveryAreas[Object.keys(topDeliveryAreas).reduce((a, b) => (topDeliveryAreas[a].totalOrders > topDeliveryAreas[b].totalOrders ? a : b))].coordinates!,
        totalOrders: Math.max(...Object.values(topDeliveryAreas).map((area) => area.totalOrders)),
      },
      topDeliveryAreas: topDeliveryAreasArray,
    },
    topSellingItems: topSellingItemsArray,
    peakOrderTime: "12:00 - 14:00",  // Example value, this would be computed from more detailed order timestamps.
    averageOrderProcessingTime,
    orderStatusDistribution,
    discountCodeUsage,
    operationalEfficiency: {
      averageCookingTime,
      averageDeliveryTime,
    },
    customerFeedback: {
      comments: totalFeedbackComments,
      averageRating: parseFloat(averageFeedbackRating),
    },
  };
}
