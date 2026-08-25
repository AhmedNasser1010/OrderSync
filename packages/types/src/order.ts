export type OrderStatusType =
  | "RECEIVED"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "RESERVED"
  | "PICKED_UP"
  | "ON_ROUTE"
  | "DELIVERED"
  | "GIVEN_FEEDBACK"
  | "CANCELED"
  | "REJECTED"
  | "VOIDED";

export type OrderType = {
  id: string;
  orderNumber: number;

  createdAt: number;
  updatedAt: number;

  businessId: string;
  customerUid: string;

  /** Denormalized from business settings (hideFromMarketplace || allowMarkComplete).
   *  Lets driver_app filter these orders at the Firestore query level. */
  marketplaceHidden?: boolean;

  status: {
    current: OrderStatusType;
    cancellationReason?: string;
    returnedByDriverUid?: string | null;
    history: {
      status: OrderStatusType;
      timestamp: number;
      by: string;
    }[];
  };

  timeline: {
    placedAt: number;

    acceptedAt?: number;
    preparingAt?: number;

    readyAt?: number;

    reservedAt?: number;

    pickedUpAt?: number;

    onRouteAt?: number;

    deliveredAt?: number;

    feedbackAt?: number;

    canceledAt?: number;
    rejectedAt?: number;
    voidedAt?: number;
  };

  customer: {
    uid: string;
    name: string;
    phone: string;
    secondPhone?: string;

    firstOrderDate: number;
    totalOrders: number;
    totalOrdersValue: number;
  };

  business: {
    id: string;
    name: string;
    nameInAr: string;
    phone: string;

    address: string;
    latlng: [number, number];
  };

  assignment: {
    driverUid: string | null;

    reservedUntil?: number;
  };

  delivery: {
    address: string;
    latlng: [number, number];
    note?: string;
  };

  cart: {
    id: string;
    name: string;
    quantity: number;
    selectedSize: string;
    discountCode?: string;
  }[];

  pricing: {
    subtotal: number;
    discount: number;
    deliveryFees: number;
    total: number;
  };

  payment: {
    method: string;
    status: string;
  };

  finance: {
    commissionPercent: number;

    commissionAmount: number;

    restaurantShare: number;

    companyShare: number;

    cashCollected: number;

    driverEarnings: number;
  };

  customerFeedback?: {
    rating: number;
    comment: string;
  };

  notes: {
    order?: string;
  };

  metadata: {
    orderSource: string;

    cancelAutoAssign?: boolean;
  };
};
