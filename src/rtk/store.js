import { configureStore } from '@reduxjs/toolkit';

// Slices
import businessesSlice from "./slices/businessesSlice.js";
import userSlice from "./slices/userSlice.js";

export const store = configureStore({
  reducer: {
    businesses: businessesSlice,
    user: userSlice,
  }
});