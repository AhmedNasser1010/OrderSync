export type OrderStatusType =
  | "RECEIVED"
  | "ACCEPTED"
  | "PREPARING"
  | "PICK_UP"
  | "ON_ROUTE"
  | "DELIVERED"
  | "GIVEN_FEEDBACK"
  | "CANCELED"
  | "REJECTED"
  | "VOIDED";

export type OrderType = {
  accessToken: string;
  id: string;
  cancelAutoAssign?: boolean;
  deliveryFees: number;
  orderNote?: string;
  orderSource: string;
  createdAt: number;
  updatedAt: number;
  accepted: boolean | null;
  cart: {
    id: string;
    quantity: number;
    selectedSize: string;
    discountCode: string;
  }[];
  cartTotalPrice: {
    discount: number;
    total: number;
  };
  customer: {
    uid: string;
    firstOrderDate: number;
    name: string;
    phone: string;
    secondPhone?: string;
    totalOrders: number;
    totalOrdersValue: number;
  };
  customerFeedback: {
    comment: string;
    rating: number;
  };
  delivery: {
    uid: string;
    liveLocation: [number, number];
    name: string;
    phone: string;
    status: string;
  };
  location: {
    address: string;
    latlng: [number, number];
    orderNote: string;
    orderSource: string;
  };
  orderTimestamps: {
    deliveredAt: number;
    feedbackAt: number;
    onRouteAt: number;
    pickUpAt: number;
    placedAt: number;
    preparedAt: number;
    acceptedAt: number;
  };
  payment: {
    method: string;
    status: string;
  };
  status: {
    current: OrderStatusType;
    history: {
      status: string;
      timestamp: number;
    };
  };
};
