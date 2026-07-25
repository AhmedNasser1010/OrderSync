export interface DiscountAnalyticsData {
  discountId: string;
  restaurantId: string;
  period: string;
  impressions: number;
  redemptions: number;
  conversionRate: number;
  revenueImpact: number;
  avgDiscountValue: number;
  uniqueUsers: number;
}
