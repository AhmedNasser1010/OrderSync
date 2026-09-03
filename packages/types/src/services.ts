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
  maintenance?: {
    enabled: boolean;
    message?: string | null;
    eta?: string | null;
  };
  enableLiveTrackingMap?: boolean;
  updatedAt: number;
  updatedBy: string;
}

export interface DeliveryFeesConfig {
  perKm: number;
  min: number;
}
