import { configureStore } from '@reduxjs/toolkit'

// Slices
import conditionalValuesSlice from "./slices/conditionalValuesSlice.js"
import businessSlice from "./slices/businessSlice.js"
import apiUsageSlice from "./slices/apiUsageSlice.js"
import userSlice from "./slices/userSlice.js"
import ordersSlice from "./slices/ordersSlice.js"
import menuSlice from "./slices/menuSlice.js"
import queueSlice from './slices/queueSlice.js'

export const store = configureStore({
  reducer: {
    conditionalValues: conditionalValuesSlice,
    business: businessSlice,
    apiUsage: apiUsageSlice,
    user: userSlice,
    orders: ordersSlice,
    menu: menuSlice,
    queue: queueSlice
  }
})