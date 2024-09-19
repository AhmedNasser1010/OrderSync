export type DateType = string
export type TotalOrdersType = number
export type TotalRevenueType = number
export type TotalDiscountsType = number
export type TotalDeliveryFeesType = number

export type MenuItemAnalyticsType = {
  id: string;
  name: string;
  quantitySold: number;
  totalRevenue: number;
  totalDiscounts: number;
};

export type OrderDurationsType = {
  averagePreparationTime: number;
  averageDeliveryTime: number;
  averageCompletionTime: number;
}

export type CustomerInsightsType = {
  totalUniqueCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageRating: number;
  feedbackCount: number;
}

export type PaymentMethodsType = Record<string, number>
export type OrderSourcesType = Record<string, number>

export type CancelledOrdersType = {
  totalCancelled: number;
  cancellationRate: number;
}

export type HighestValueCustomerType = {
  name: string;
  totalOrdersValue: number;
}

export type RevenuePerCustomerType = {
  highestValueCustomer: HighestValueCustomerType;
  averageOrderValue: number;
}

export type LocationCountsType = Record<string, {
  address: string;
  latlng: [number, number];
  ordersCount: number;
}>

export type DaySummaryType = {
  date: DateType;
  totalOrders: TotalOrdersType;
  totalRevenue: TotalRevenueType;
  totalDiscounts: TotalDiscountsType;
  totalDeliveryFees: TotalDeliveryFeesType;
  menuItemAnalytics: MenuItemAnalyticsType[];
  orderDurations: OrderDurationsType;
  customerInsights: CustomerInsightsType;
  paymentMethods: PaymentMethodsType;
  orderSources: OrderSourcesType;
  topLocations: LocationCountsType[];
  cancelledOrders: CancelledOrdersType;
  revenuePerCustomer: RevenuePerCustomerType;
};