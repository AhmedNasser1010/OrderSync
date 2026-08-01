import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BusinessDocument } from "@ordersync/types";

export type RestaurantsState = BusinessDocument[];

const initialState: RestaurantsState = [];

export const restaurantsSlice = createSlice({
  name: "restaurants",
  initialState,
  reducers: {
    initRestaurants: (_state, { payload }: PayloadAction<BusinessDocument[]>) => {
      return payload.filter((r) => r.status !== "hidden");
    },
    clearRestaurants: () => {
      return [];
    },
  },
});

export const { initRestaurants, clearRestaurants } = restaurantsSlice.actions;

export default restaurantsSlice.reducer;
