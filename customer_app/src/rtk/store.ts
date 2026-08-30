import { configureStore } from "@reduxjs/toolkit";

import cartSlice from "./slices/cartSlice";
import menuSlice from "./slices/menuSlice";
import checkoutSlice from "./slices/checkoutSlice";
import toggleSlice from "./slices/toggleSlice";
import userSlice from "./slices/userSlice";
import restaurantsSlice from "./slices/restaurantsSlice";
import trackingSlice from "./slices/trackingSlice";
import servicesSlice from "./slices/servicesSlice";
import filterSlice from "./slices/filterSlice";
import constantsSlice from "./slices/constantsSlice";
import authSlice from "./slices/authSlice";

import { firestoreApi } from "./api/firestoreApi";

export const makeStore = () => {
  return configureStore({
    devTools: true,
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
      constants: constantsSlice,
      auth: authSlice,
      [firestoreApi.reducerPath]: firestoreApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(firestoreApi.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
