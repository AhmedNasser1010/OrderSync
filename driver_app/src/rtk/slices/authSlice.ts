import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Driver } from "@ordersync/types";

export type SerializableUser = {
  uid: string;
  email: string | null;
};

export type AuthState = {
  user: SerializableUser | null;
  isOnboarded: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  authMethod: "google" | "email" | "guest" | null;
  providerData: Driver["userInfo"];
  error: string | null;
};

export const initialState: AuthState = {
  user: null,
  isOnboarded: false,
  isLoading: false,
  isInitializing: true,
  authMethod: null,
  providerData: {
    uid: "",
    email: "",
    name: "",
    phone: "",
    role: "DRIVER",
    provider: "",
  },
  error: null,
};

export const signUp = createAsyncThunk(
  "auth/signUp",
  async (
    {
      user,
      authMethod,
    }: {
      user: SerializableUser;
      authMethod: "google" | "email" | "guest";
    },
    { dispatch }
  ) => {
    dispatch(setAuthMethod(authMethod));
    return user;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<SerializableUser | null>) {
      state.user = action.payload;
    },
    setProviderData(state, action: PayloadAction<AuthState["providerData"]>) {
      state.providerData = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setAuthMethod(state, action) {
      state.authMethod = action.payload;
    },
    setInitialized(state) {
      state.isInitializing = false;
    },
    setIsLoading(state, action) {
      state.isLoading = action.payload;
    },
    setIsOnboarded(state, action) {
      state.isOnboarded = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "An unknown error occurred";
      });
  },
});

export const {
  setIsLoading,
  setAuthError,
  setInitialized,
  setProviderData,
  setAuthMethod,
  setIsOnboarded,
  setUser,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
export const selectIsInitializing = (state: { auth: AuthState }) =>
  state.auth.isInitializing;
export const selectAuthMethod = (state: { auth: AuthState }) =>
  state.auth.authMethod;
export const selectProviderData = (state: { auth: AuthState }) =>
  state.auth.providerData;
export const selectIsOnboarded = (state: { auth: AuthState }) =>
  state.auth.isOnboarded;
export const selectError = (state: { auth: AuthState }) =>
  state.auth.error;
