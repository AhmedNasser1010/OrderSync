import { configureStore } from '@reduxjs/toolkit'

// Slices
import userSlice from "./slices/userSlice.js"
import menuSlice from "./slices/menuSlice.js"
import conditionalValuesSlice from "./slices/conditionalValuesSlice.js"
import ordersSlice from './slices/ordersSlice.js'
import businessSlice from './slices/businessSlice.js'
import staffSlice from './slices/staffSlice.js'
import partnerServicesSlice from './slices/partnerServicesSlice.js'

export const store = configureStore({
  reducer: {
    user: userSlice,
    menu: menuSlice,
    conditionalValues: conditionalValuesSlice,
    orders: ordersSlice,
    business: businessSlice,
    staff: staffSlice,
    partnerServices: partnerServicesSlice
  }
});