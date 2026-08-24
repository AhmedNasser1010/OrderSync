export interface ServicesDocument {
  deliveryFeesPerKm: number;
  minDeliveryFees: number;
  maxWorkDistanceKm: number;
  updatedAt: number;
  updatedBy: string;
}

export interface DeliveryFeesConfig {
  perKm: number;
  min: number;
}
