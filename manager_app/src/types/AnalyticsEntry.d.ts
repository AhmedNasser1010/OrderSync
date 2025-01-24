// Represents a single location with orders count and coordinates
export type TopLocation = {
  latlng: [number, number];
  address: string;
  ordersCount: number;
};

// Represents analytics for a single category
export type CategoryAnalytics = {
  totalQuantitySold: number;
  totalDiscountsSave: number;
  totalRevenue: number;
  title: string;
};

// Represents analytics for a single item
export type ItemAnalytics = {
  category: string;
  totalQuantitySold: number;
  totalRevenue: number;
  totalDiscountsSave: number;
  title: string;
};

// Represents revenue per customer insights
export type RevenuePerCustomer = {
  averageOrderValue: number;
  highestValueCustomer: {
    name: string;
    totalOrdersValue: number;
  };
};

// Represents order durations
export type OrderDurations = {
  averagePreparationTime: number;
  averageDeliveryTime: number;
  averageCompletionTime: number;
};

// Represents customer insights
export type CustomerInsights = {
  averageRating: number;
  newCustomers: number;
  returningCustomers: number;
  feedbackCount: number;
  totalUniqueCustomers: number;
};

// Represents cancelled order statistics
export type CancelledOrders = {
  totalCancelled: number;
  cancellationRate: number;
};

// Represents a single analytics entry
export type AnalyticsEntry = {
  date: string;
  totalDeliveryFees: number;
  totalDiscounts: number;
  totalRevenue: number;
  totalOrders: number;
  orderSources: Record<string, number>;
  paymentMethods: Record<string, number>;
  revenuePerCustomer: RevenuePerCustomer;
  orderDurations: OrderDurations;
  customerInsights: CustomerInsights;
  cancelledOrders: CancelledOrders;
  categoriesAnalytics: CategoryAnalytics[];
  itemsAnalytics: ItemAnalytics[];
  topLocations: TopLocation[];
};
