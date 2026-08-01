import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface TrackingState {
  order: Record<string, unknown> | null;
  driver: Record<string, unknown> | null;
  res: Record<string, unknown> | null;
}

const initialState: TrackingState = {
  order: null,
  driver: null,
  res: null,
};

export const trackingSlice = createSlice({
  name: "tracking",
  initialState,
  reducers: {
    initOrder: (state, { payload }: PayloadAction<Record<string, unknown>>) => {
      state.order = payload;
    },
    initDriver: (state, { payload }: PayloadAction<Record<string, unknown>>) => {
      state.driver = payload;
    },
    initRes: (state, { payload }: PayloadAction<Record<string, unknown>>) => {
      state.res = payload;
    },
    trackingReset: () => {
      return {
        order: null,
        driver: null,
        res: null,
      };
    },
    clearOrder: (state) => {
      state.order = null;
    },
    clearDriver: (state) => {
      state.driver = null;
    },
    clearRes: (state) => {
      state.res = null;
    },
  },
});

export const {
  initOrder,
  initDriver,
  initRes,
  trackingReset,
  clearOrder,
  clearDriver,
  clearRes,
} = trackingSlice.actions;

export default trackingSlice.reducer;
