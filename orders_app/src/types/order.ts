export type OrderStatus = "RECEIVED" | "ON_GOING" | "COMPLETED";

export type FormattedOrder = {
  id: string;
  customer: string;
  items: string;
  total: string;
  status: OrderStatus;
  accepted: boolean;
};

// Type for Payment
type PaymentType = {
  method: string; // You might want to use a union type if you have a limited set of methods
};

// Type for a Cart Item
export type CartItemType = {
  id: string;
  selectedSize: string | null;
  quantity: number;
  discountCode?: string; // Optional property
};

// Type for Cart Total Price
type CartTotalPriceType = {
  total: number;
  discount: number;
};

// Type for User
type UserType = {
  uid: string;
  phone: string;
  name: string;
  secondPhone: string;
};

// Type for Location
type LocationType = {
  latlng: [number, number]; // Tuple for latitude and longitude
  address: string;
};

// Type for Assign
type AssignType = {
  driverStartAt: number | null; // Assuming timestamps
  cook: number | null; // Assuming timestamps or IDs
  status: string; // You might want to use a union type for status
  cancelAutoAssign: boolean;
  driver: string | null; // Assuming ID or null
  cookStartAt: number | null; // Assuming timestamps
};

// Main Object Type
export type Order = {
  payment: PaymentType;
  cart: CartItemType[];
  cartTotalPrice: CartTotalPriceType;
  comment: string;
  user: UserType;
  deliveryFees: number;
  id: string;
  statusUpdatedSince: number;
  status: OrderStatus;
  location: LocationType;
  timestamp: number;
  assign: AssignType;
  accessToken: string;
  accepted: boolean;
};
