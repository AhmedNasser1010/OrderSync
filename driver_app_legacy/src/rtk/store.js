import { configureStore } from '@reduxjs/toolkit'

// Slices
import conditionalValuesSlice from "./slices/conditionalValuesSlice.js"
import businessSlice from "./slices/businessSlice.js"
import apiUsageSlice from "./slices/apiUsageSlice.js"
import userSlice from "./slices/userSlice.js"
import ordersSlice from "./slices/ordersSlice.js"
import menusSlice from "./slices/menusSlice.js"
import queueSlice from './slices/queueSlice.js'
import partnerServicesSlice from './slices/partnerServicesSlice.js'

export const store = configureStore({
  reducer: {
    conditionalValues: conditionalValuesSlice,
    business: businessSlice,
    apiUsage: apiUsageSlice,
    user: userSlice,
    orders: ordersSlice,
    menus: menusSlice,
    queue: queueSlice,
    partnerServices: partnerServicesSlice
  }
})