export type RestaurantStatusTypes = "active" | "inactive" | "busy" | "pause";

export type BusinessSettings = {
  siteControl: {
    closeMsg: string;
    availability: boolean;
    autoAvailability: boolean;
    isBusy: boolean;
    temporaryPause: boolean;
    status: RestaurantStatusTypes;
  };
  orderManagement: {
    assign: {
      forCooks: boolean;
      forDeliveryWorkers: boolean;
    };
    driverAssignment: boolean;
    printInvoice: boolean;
  };
};

export type BusinessDocument = {
  accessToken: string;
  partnerUid: string;
  owner: {
    uid: string;
    email: string;
    phone: string;
    name: string;
    secondPhone?: string;
  };
  business: {
    name: string;
    nameInAr: string;
    industry: string;
    address: string;
    latlng: [number, number];
    cover: string;
    icon: string;
    promotionalSubtitle: string;
    cuisines: string[];
  };
  services: {
    openingHours: Record<
      string,
      {
        start: string;
        end: string;
        closed: boolean;
      }
    >;
    cookTime: [number, number];
    paymentMethods: {
      cash: boolean;
      etisalatCash?: boolean;
      vodafoneCash?: boolean;
    };
  };
  settings: BusinessSettings;
  status: RestaurantStatusTypes;
  updatedAt: number;
  createdAt: number;
  topChains: boolean;
  reviewSummary: {
    averageRating: number;
    totalRatingPoints: number;
    totalReviews: number;
    stars: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
};
