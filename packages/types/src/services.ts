export interface ServicesDocument {
  deliveryFeesPerKm: number;
  minDeliveryFees: number;
  updatedAt: number;
  updatedBy: string;
}

export interface DeliveryFeesConfig {
  perKm: number;
  min: number;
}
