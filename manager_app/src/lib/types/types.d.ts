export type StatusType = "good" | "warning" | "alert"

export interface KPIData {
  label: string;
  value: string | number;
  change: number;
  icon: string;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopItem {
  rank: number;
  name: string;
  quantity: number;
  revenue: number;
  growth: number;
}

export interface Category {
  name: string;
  revenue: number;
  percentage: number;
  status: StatusType;
}

export interface CustomerData {
  totalCustomers: number;
  returningCustomers: number;
  newCustomers: number;
  feedbackCount: number;
  averageRating: number;
  returningPercentage: number;
  newPercentage: number;
  topCustomer: {
    name: string;
    totalOrderCount: number;
    totalOrdersValue: number;
  };
}

export interface OperationMetrics {
  label: string;
  time: string;
  status: StatusType;
  benchmark: string;
}

export interface DeliveryArea {
  location: string;
  orders: number;
  percentage: number;
}

export interface PaymentMethod {
  name: string;
  percentage: number;
  orders: number;
}

export interface BusinessHealthData {
  score: number;
  maxScore: number;
  strengths: string[];
  alerts: string[];
  trends: {
    label: string;
    change: number;
    status: StatusType;
  }[];
}

export interface DashboardData {
  dateRange: string;
  kpis: KPIData[];
  aiInsights: string[];
  salesTrends: ChartDataPoint[];
  topItems: TopItem[];
  categories: Category[];
  customerAnalytics: CustomerData;
  operations: OperationMetrics[];
  deliveryAreas: DeliveryArea[];
  paymentMethods: PaymentMethod[];
  orderSources: OrderSource[];
  businessHealth: BusinessHealthData;
}
