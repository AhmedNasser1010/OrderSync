export type OrderStatusType = "RECEIVED" | "PREPARING" | "DELIVERY" | "COMPLETED" | "CANCELED" | "REJECTED";

// Type for status history entry
export type StatusHistoryEntryType = {
  status: OrderStatusType;
  timestamp: number;
}

// Type for status object
export type StatusType = {
  current: OrderStatusType;
  history: StatusHistoryEntryType[];
}

// Type for order timestamps
export type OrderTimestampsType = {
  placedAt: number;
  cookedAt: number;
  pickedUpAt: number;
  deliveredAt: number;
}

export type DeliveryStatusType = "DELIVERED" | "PENDING" | "PREPARING"

// Type for delivery object
export type DeliveryType = {
  driver: string;
  status: DeliveryStatusType;
  estimatedTime: number;
}

export type ItemSizesType = "S" | "M" | "L"

// Type for cart item
export type CartItemType = {
  id: string;
  quantity: number;
  selectedSize: ItemSizesType;
  note: string;
  discountCode: string;
  toppings: {
    type: string;
    enabled: boolean;
  }[];
}

// Type for cart total price
export type CartTotalPriceType = {
  total: number;
  discount: number;
  orderLevelDiscount?: string;
}

// Type for payment object
export type PaymentType = {
  method: "CASH";
  status: "COMPLETED";
}

// Type for location object
export type LocationType = {
  latlng: [number, number];
  address: string;
}

// Type for customer object
export type CustomerType = {
  uid: string;
  name: string;
  phone: string;
  firstOrderDate: number;
  totalOrders: number;
  loyaltyPoints: number;
}

// Type for customer feedback object
export type CustomerFeedbackType = {
  rating: number;
  comment: string;
}

// Type for the main order object
export type OrderType = {
  id: string;
  timestamp: number;
  cancelAutoAssign: boolean;
  status: StatusType;
  orderTimestamps: OrderTimestampsType;
  delivery: DeliveryType;
  cart: CartItemType[];
  cartTotalPrice: CartTotalPriceType;
  deliveryFees: number;
  payment: PaymentType;
  location: Location;
  customer: CustomerType;
  customerFeedback: CustomerFeedbackType;
  orderSource: string;
}