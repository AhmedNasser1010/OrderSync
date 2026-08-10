export interface ServicesDocument {
  deliveryFeesPerKm: number;
  minDeliveryFees: number;
  commissionPercent: number;
  updatedAt: number;
  updatedBy: string;
}

export interface DeliveryFeesConfig {
  perKm: number;
  min: number;
}
