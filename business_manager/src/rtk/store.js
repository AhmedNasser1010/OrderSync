import { configureStore } from '@reduxjs/toolkit';

// Slices
import userSlice from "./slices/userSlice.js";
import menuSlice from "./slices/menuSlice.js";
import conditionalValuesSlice from "./slices/conditionalValuesSlice.js";

export const store = configureStore({
  reducer: {
    user: userSlice,
    menu: menuSlice,
    conditionalValues: conditionalValuesSlice
  }
});