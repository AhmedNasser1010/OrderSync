import { configureStore } from '@reduxjs/toolkit';

// Slices
import businessesSlice from "./slices/businessesSlice.js";
import userSlice from "./slices/userSlice.js";
import ordersSlice from "./slices/ordersSlice.js";

export const store = configureStore({
  reducer: {
    businesses: businessesSlice,
    user: userSlice,
    orders: ordersSlice,
  }
});