import type { CategoryType, ItemType } from "@ordersync/types";

export type StatusType = "good" | "warning" | "alert";

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

export type AIInsight =
  | { type: "bestSeller"; itemName: string }
  | { type: "strongRetention"; percentage: number }
  | { type: "topCategory"; categoryName: string; percentage: number };

export interface OperationMetrics {
  type: "prepTime" | "deliveryTime" | "completion";
  value: number;
  status: StatusType;
  target: number;
  unit: "minutes" | "percentage";
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

export interface OrderSource {
  name: string;
  orders: number;
  percentage: number;
  status: StatusType;
}

export type StrengthItem =
  | { type: "strongRetention"; percentage: number }
  | { type: "excellentCompletion"; rate: number }
  | { type: "fastPrepTime"; minutes: number }
  | { type: "revenueIncrease"; growth: number };

export type AlertItem =
  | { type: "lowRetention" }
  | { type: "lowCompletion" }
  | { type: "slowPrepTime" }
  | { type: "weakCategory"; categoryName: string; percentage: number };

export interface TrendItem {
  type: "revenueGrowth" | "customerGrowth" | "efficiency";
  change: number;
  status: StatusType;
}

export interface BusinessHealthData {
  score: number;
  maxScore: number;
  strengths: StrengthItem[];
  alerts: AlertItem[];
  trends: TrendItem[];
}

export interface DashboardData {
  dateRange: string;
  kpis: KPIData[];
  aiInsights: AIInsight[];
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

export interface MenuCategory extends CategoryType {
  items: ItemType[];
}

export interface MenuData {
  categories: MenuCategory[];
  lastSynced: string;
}

export type { ItemType, CategoryType };
