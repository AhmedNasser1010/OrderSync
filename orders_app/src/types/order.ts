export type OrderStatusType =
  | "RECEIVED"
  | "PREPARING"
  | "DELIVERY"
  | "COMPLETED"
  | "CANCELED"
  | "REJECTED"
  | "VOIDED";

export type StatusHistoryEntryType = {
  status: OrderStatusType;
  timestamp: number;
};

export type StatusType = {
  current: OrderStatusType;
  accepted: boolean;
  cancellationReason?: string;
  history: StatusHistoryEntryType[];
};

export type OrderTimestampsType = {
  placedAt: number;
  preparedAt: number;
  deliveryAt: number;
  completedAt: number;
  canceledAt: number;
  rejectedAt: number;
};

export type DeliveryStatusType = "DELIVERED" | "PENDING" | "PREPARING";

export type DeliveryType = {
  driver: string;
  status: DeliveryStatusType;
  estimatedTime: number;
};

export type ItemSizesType = "S" | "M" | "L";

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
};

export type CartTotalPriceType = {
  total: number;
  discount: number;
  orderLevelDiscount?: string;
};

export type PaymentType = {
  method: "CASH";
  status: "COMPLETED";
};

export type LocationType = {
  latlng: [number, number];
  address: string;
};

export type CustomerType = {
  uid: string;
  name: string;
  phone: string;
  firstOrderDate: number;
  totalOrders: number;
  totalOrdersValue: number;
};

export type CustomerFeedbackType = {
  rating: number;
  comment: string;
};

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
  location: LocationType;
  customer: CustomerType;
  customerFeedback: CustomerFeedbackType;
  orderSource: string;
};

export type FormattedOrderType = {
  id: string;
  customer: string;
  items: string;
  total: string;
  status: OrderStatusType;
  accepted: boolean;
};
