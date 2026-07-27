import { configureStore } from '@reduxjs/toolkit';
import { firestoreApi } from './api/firestoreApi';
import authSlice from './slices/authSlice';
import toggleSlice from './slices/toggleSlice';

export const makeStore = () => {
  return configureStore({
    devTools: true,
    reducer: {
      auth: authSlice,
      toggle: toggleSlice,
      [firestoreApi.reducerPath]: firestoreApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(firestoreApi.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
