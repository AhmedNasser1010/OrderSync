import { configureStore } from '@reduxjs/toolkit';

// Slices
import businessesSlice from "./slices/businessesSlice.js";

export const store = configureStore({
  reducer: {
    businesses: businessesSlice,
  }
});