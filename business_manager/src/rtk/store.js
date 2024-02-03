import { configureStore } from '@reduxjs/toolkit';

// Slices
import userSlice from "./slices/userSlice.js";

export const store = configureStore({
  reducer: {
    user: userSlice,
  }
});