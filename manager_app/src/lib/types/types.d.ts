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

export interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  sizes?: { size: string; price: string | number }[];
  category: string;
  visible: boolean;
  featured: boolean;
  timestamp: number;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    active: boolean;
  };
  backgrounds?: string[];
  promotionRules?: PromotionRule[];
}

export interface PromotionRule {
  id: string;
  name: string;
  type: "total_spent" | "first_purchase" | "quantity" | "order_count";
  threshold: number;
  active: boolean;
}

export interface MenuCategory {
  id: string;
  title: string;
  description: string;
  visible: boolean;
  featured: boolean;
  timestamp: number;
  items: MenuItem[];
  position: number;
  backgrounds?: string[];
}

export interface MenuData {
  categories: MenuCategory[];
  lastSynced: string;
}

export interface MenuDocument {
  categories: Omit<MenuCategory, "items">[];
  items: MenuItem[];
  lastSynced: string;
  accessToken?: string;
}

export interface UserInfo {
  email: string;
  role: "BUSINESS_MANAGER";
  uid: string;
  name: string;
  phone: string;
}

export interface User {
  joinDate: number;
  userInfo: UserInfo;
  accessToken: string;
  partnerUid: string;
}
