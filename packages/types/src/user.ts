export type ManagerUser = {
  uid: string;
  accessToken: string;
  partnerUid: string;
  createdAt: number;
  updatedAt: number;
  userInfo: {
    uid: string;
    email: string;
    name: string;
    phone: string;
    secondPhone?: string;
    role: "BUSINESS_MANAGER";
    provider: string;
  };
};

export type PartnerUser = {
  uid: string;
  createdAt: number;
  updatedAt: number;
  data: {
    businesses: string[];
    uid: string;
  };
  services: {
    deliveryFees: {
      perKm: number;
      maxKmDistance: number;
      lowestFees: number;
    };
    driversDues: {
      warning: number;
      max: number;
    };
  };
  userInfo: {
    uid: string;
    email: string;
    name: string;
    role: "BUSINESSES_CREATOR";
    phone: string;
    secondPhone?: string;
    provider: string;
  };
};
