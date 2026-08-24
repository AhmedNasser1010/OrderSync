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
    dailyAdvance: number;
    dailyAdvanceDate: number;
    earnings: number;
  };
  fcmTokens?: string[];
  notifyPush?: boolean;
  theme?: "light" | "dark";
  locale?: "en" | "ar";
  skipStartRoute?: boolean;
  /**
   * Allowlist of business IDs whose READY orders this driver sees in the
   * marketplace. Empty/undefined means all restaurants are visible.
   */
  visibleBusinessIds?: string[];
};
