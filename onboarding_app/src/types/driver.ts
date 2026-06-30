import { OrderType } from  './order'

type OnlineStatus = {
  byManager: boolean;
  byUser: boolean;
};

type UserInfo = {
  email: string;
  name: string;
  phone: string;
  role: "DRIVER";
  vehicle: "MOTORCYCLE";
};

export type Driver = {
  accessToken?: string;
  partnerUid: string;
  uid: string;
  sync: "LOCAL" | "GLOBAL";
  joinDate: number;
  ordersDues: number;
  trackingFeature: boolean;
  liveLocation: [number, number];
  online: OnlineStatus;
  queue: OrderType[];
  userInfo: UserInfo;
};
