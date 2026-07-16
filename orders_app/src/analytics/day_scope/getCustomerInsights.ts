import type { OrderType } from '@ordersync/types';
import { CustomerInsightsType } from "@/analytics/types";

export default function getCustomerInsights(
  order: OrderType
): CustomerInsightsType {
  const uniqueCustomers = new Set<string>();
  let newCustomers = 0;
  let returningCustomers = 0;
  let totalRatings = 0;
  let feedbackCount = 0;

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

  return {
    totalUniqueCustomers: uniqueCustomers.size,
    newCustomers,
    returningCustomers,
    averageRating: feedbackCount > 0 ? totalRatings / feedbackCount : 0,
    feedbackCount,
  };
}
