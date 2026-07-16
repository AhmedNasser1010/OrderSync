export type DailyReport = {
  businessId: string;
  businessDate: string;
  createdAt: number;
  totalOrders: number;
  totalRevenue: number;
  totalDiscounts: number;
  totalDeliveryFees: number;
  itemsAnalytics: {
    title: string;
    category: string;
    totalQuantitySold: number;
    totalRevenue: number;
  }[];
  categoriesAnalytics: {
    title: string;
    totalQuantitySold: number;
    totalRevenue: number;
  }[];
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
};
