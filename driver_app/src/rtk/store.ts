import { configureStore } from '@reduxjs/toolkit';
import { firestoreApi } from './api/firestoreApi';
import authSlice from './slices/authSlice';

export const makeStore = () => {
  return configureStore({
    devTools: true,
    reducer: {
      auth: authSlice,
      [firestoreApi.reducerPath]: firestoreApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(firestoreApi.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
