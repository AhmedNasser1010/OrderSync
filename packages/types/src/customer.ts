export type CustomersRes = {
  accessToken: string;
  firstOrderTime: number;
  lastOrderTime: number;
  totalAmount: number;
  totalItems: number;
  totalOrders: number;
};

export type CustomerType = {
  partnerUid: string;
  uid: string;
  createdAt: number;
  updatedAt: number;
  locations: {
    city: string;
    selected: string;
    home: {
      address: string;
      latlang: [number, number];
    };
  };
  referral: {
    isFirstOrder: boolean;
    referredBy: string;
    successReferred: string[];
  };
  restaurants: CustomersRes[];
  trackedOrder: {
    id: string | null;
    orderNumber: number | null;
    loyaltyCountedForOrderId: string;
    pendingLoyalty: string | null;
    restaurant: string;
  };
  userInfo: {
    avatar: string;
    email: string;
    name: string;
    phone: string;
    provider: string;
    role: "CUSTOMER";
    secondPhone?: string;
    uid: string;
  };
};
