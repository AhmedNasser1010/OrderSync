export interface PlaceOrderInput {
  customerUid: string;
  business: {
    id: string;
    name: string;
    nameInAr: string;
    phone: string;
    address: string;
    latlng: number[];
  };
  assignment?: { driverUid?: string | null } | null;
  delivery: {
    address: string;
    latlng: number[];
    note?: string;
  };
  cart: {
    id: string;
    name: string;
    quantity: number;
    selectedSize?: string | null;
    discountCode?: string;
  }[];
  pricing: {
    subtotal: number;
    discount: number;
    deliveryFees: number;
    total: number;
    promoCode?: string;
    promoDiscount?: number;
  };
  payment: { method: string; status: string };
  finance?: Record<string, number>;
  reconciliation?: Record<string, unknown>;
  notes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  customer: {
    uid: string;
    name: string;
    phone: string;
    secondPhone?: string;
    firstOrderDate: number;
    totalOrders: number;
    totalOrdersValue: number;
  };
}
