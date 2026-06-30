import { configureStore } from '@reduxjs/toolkit';
import { firestoreApi } from './api/firestoreApi';
import constantsSlice from './slices/constantsSlice';
import uiSlice from './slices/uiSlice';
import authSlice from './slices/authSlice';

export const makeStore = () => {
  return configureStore({
    devTools: true,
    reducer: {
      auth: authSlice,
      constants: constantsSlice,
      ui: uiSlice,
      [firestoreApi.reducerPath]: firestoreApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(firestoreApi.middleware)
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

