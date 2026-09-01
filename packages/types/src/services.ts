export interface ServicesDocument {
  deliveryFeesPerKm: number;
  minDeliveryFees: number;
  maxWorkDistanceKm: number;
  cashback?: {
    enabled: boolean;
    cashbackPercent: number;
    wipeDays: number;
    redemptionThreshold: number;
    maxCashbackPerTx: number;
  };
  updatedAt: number;
  updatedBy: string;
}

export interface DeliveryFeesConfig {
  perKm: number;
  min: number;
}
