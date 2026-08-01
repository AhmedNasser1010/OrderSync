import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CustomersRes } from "@ordersync/types";

export interface UserLocation {
  latlng?: number[];
  address?: string;
}

export interface UserState {
  uid?: string;
  createdAt?: number;
  isActive?: boolean;
  userInfo?: {
    uid?: string;
    name?: string;
    phone?: string;
    secondPhone?: string;
  };
  locations?: {
    selected?: string;
    home?: UserLocation;
    work?: UserLocation;
    city?: string;
  };
  trackedOrder?: {
    id?: string | null;
    orderNumber?: string;
    restaurant?: string | null;
    driverId?: string | null;
    pendingLoyalty?: Record<string, unknown> | null;
    loyaltyCountedForOrderId?: string | null;
  };
  restaurants?: CustomersRes[];
  [key: string]: unknown;
}

const initialState: UserState = {};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    initUser: (_state, { payload }: PayloadAction<UserState>) => {
      return payload;
    },
    clearUser: () => {
      return {};
    },
    addUserHomeLocation: (state, { payload }: PayloadAction<number[]>) => {
      return {
        ...state,
        locations: {
          ...state.locations,
          home: {
            ...state.locations?.home,
            latlng: payload,
          },
        },
      };
    },
    addUserAddress: (state, { payload }: PayloadAction<string>) => {
      return {
        ...state,
        locations: {
          ...state.locations,
          home: {
            ...state.locations?.home,
            address: payload,
          },
        },
      };
    },
    updateUserName: (state, { payload }: PayloadAction<string>) => {
      return {
        ...state,
        userInfo: {
          ...state.userInfo,
          name: payload,
        },
      };
    },
    updateUserPhone: (state, { payload }: PayloadAction<string>) => {
      return {
        ...state,
        userInfo: {
          ...state.userInfo,
          phone: payload,
        },
      };
    },
    updateUserAddress: (state, { payload }: PayloadAction<string>) => {
      return {
        ...state,
        locations: {
          ...state.locations,
          home: {
            ...state.locations?.home,
            address: payload,
          },
        },
      };
    },
    updateUserLocation: (state, { payload }: PayloadAction<number[]>) => {
      return {
        ...state,
        locations: {
          ...state.locations,
          home: {
            ...state.locations?.home,
            latlng: payload,
          },
        },
      };
    },
  },
});

export const {
  initUser,
  clearUser,
  addUserHomeLocation,
  addUserAddress,
  updateUserName,
  updateUserPhone,
  updateUserAddress,
  updateUserLocation,
} = userSlice.actions;

export default userSlice.reducer;
