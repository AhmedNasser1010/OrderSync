import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ServicesState {
  deliveryFees?: number;
  minDeliveryFees?: number;
  [key: string]: unknown;
}

const initialState: ServicesState = {};

export const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    initServices: (_state, { payload }: PayloadAction<ServicesState>) => {
      return payload;
    },
    clearServices: () => {
      return {};
    },
  },
});

export const { initServices, clearServices } = servicesSlice.actions;

export default servicesSlice.reducer;
