import { configureStore } from '@reduxjs/toolkit';
import constantsSlice from './slices/constantsSlice';
import { firestoreApi } from './api/firestoreApi';

export const makeStore = () => {
  return configureStore({
    devTools: true,
    reducer: {
      constants: constantsSlice,
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

