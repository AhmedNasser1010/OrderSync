export type Driver = {
  partnerUid: string;
  uid: string;
  createdAt: number;
  updatedAt: number;
  ordersDues: number;
  trackingFeature: boolean;
  liveLocation: [number, number];
  online: {
    byManager: boolean;
    byUser: boolean;
  };
  queue: string[];
  userInfo: {
    email: string;
    name: string;
    phone: string;
    secondPhone?: string;
    role: "DRIVER";
  };
  licensePlate?: {
    letters: string;
    numbers: number;
  };
}