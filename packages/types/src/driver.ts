export type Driver = {
  partnerUid: string;
  createdAt: number;
  updatedAt: number;
  liveLocation: [number, number];
  uid: string;
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
