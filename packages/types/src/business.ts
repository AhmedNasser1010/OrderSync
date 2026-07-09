export type RestaurantStatusTypes = "active" | "inactive" | "busy" | "pause";

export type BusinessDocument = {
  accessToken: string;
  partnerUid: string;
  branding: {
    closeMsg: string;
    promotionalSubtitle: string;
    cover: string;
    icon: string;
  };
  owner: {
    uid: string;
    email: string;
    phone: string;
    name: string;
    secondPhone?: string;
  };
  profile: {
    name: string;
    nameInAr: string;
    industry: string;
    address: string;
    latlng: [number, number]; // coordinates
    cuisines: string[];
  };
  operations: {
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
  settings: {
    printInvoice: boolean;
  };
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
