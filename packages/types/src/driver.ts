export type LiveLocation = {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  updatedAt: number;
};

export type Driver = {
  partnerUid: string;
  createdAt: number;
  updatedAt: number;
  liveLocation: LiveLocation;
  uid: string;
  accessToken?: string;
  online: {
    byManager: boolean;
    byUser: boolean;
  };
  userInfo: {
    email: string;
    name: string;
    phone: string;
    secondPhone?: string;
    role: "DRIVER";
    provider: string;
    uid: string;
  };
  licensePlate?: {
    letters: string;
    numbers: number;
  };
  finance: {
    currentCash: number;
    warningLimit: number;
    blockLimit: number;
  };
};
