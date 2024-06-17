import { configureStore } from '@reduxjs/toolkit'

// Slices
import cartSlice from "./slices/cartSlice.js"
import menuSlice from "./slices/menuSlice.js"
import conditionalValuesSlice from "./slices/conditionalValuesSlice.js"
import checkoutSlice from "./slices/checkoutSlice.js"
import businessInfoSlice from './slices/businessInfoSlice.js'

export const store = configureStore({
  reducer: {
    cart: cartSlice,
    menu: menuSlice,
    conditionalValues: conditionalValuesSlice,
    checkout: checkoutSlice,
    businessInfo: businessInfoSlice
  }
});