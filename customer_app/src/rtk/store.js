import { configureStore } from '@reduxjs/toolkit'

// Slices
import cartSlice from "./slices/cartSlice.js"
import menuSlice from "./slices/menuSlice.js"
import checkoutSlice from "./slices/checkoutSlice.js"
import toggleSlice from './slices/toggleSlice.js'
import userSlice from './slices/userSlice.js'
import restaurantsSlice from './slices/restaurantsSlice.js'
import trackingSlice from './slices/trackingSlice.js'
import servicesSlice from './slices/servicesSlice.js'
import filterSlice from './slices/filterSlice.js'

// Api
import { firestoreApi } from './api/firestoreApi.js'

export const store = configureStore({
  reducer: {
    cart: cartSlice,
    menu: menuSlice,
    checkout: checkoutSlice,
    toggle: toggleSlice,
    user: userSlice,
    restaurants: restaurantsSlice,
    tracking: trackingSlice,
    services: servicesSlice,
    filter: filterSlice,
    [firestoreApi.reducerPath]: firestoreApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(firestoreApi.middleware)
})