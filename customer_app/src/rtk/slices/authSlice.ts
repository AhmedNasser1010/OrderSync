import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated";

export interface AuthErrorInfo {
  code: string;
  message: string;
}

export interface AuthState {
  status: AuthStatus;
  uid: string | null;
  idToken: string | null;
  error: AuthErrorInfo | null;
  isOnboardingComplete: boolean;
}

const initialState: AuthState = {
  status: "loading",
  uid: null,
  idToken: null,
  error: null,
  isOnboardingComplete: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthLoading: (state) => {
      state.status = "loading";
      state.error = null;
    },
    setAuthenticated: (
      state,
      { payload }: PayloadAction<{ uid: string; idToken: string | null }>
    ) => {
      state.status = "authenticated";
      state.uid = payload.uid;
      state.idToken = payload.idToken;
      state.error = null;
    },
    setUnauthenticated: (state) => {
      state.status = "unauthenticated";
      state.uid = null;
      state.idToken = null;
      state.error = null;
    },
    setAuthError: (state, { payload }: PayloadAction<AuthErrorInfo>) => {
      state.error = payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setIdToken: (state, { payload }: PayloadAction<string | null>) => {
      state.idToken = payload;
    },
    setOnboardingComplete: (
      state,
      { payload }: PayloadAction<boolean>
    ) => {
      state.isOnboardingComplete = payload;
    },
    resetAuth: () => initialState,
  },
});

export const {
  setAuthLoading,
  setAuthenticated,
  setUnauthenticated,
  setAuthError,
  clearAuthError,
  setIdToken,
  setOnboardingComplete,
  resetAuth,
} = authSlice.actions;

export default authSlice.reducer;
