import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { firestoreApi } from "../api/firestoreApi";

export interface SerializableUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: SerializableUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const signIn = createAsyncThunk<
  SerializableUser,
  { email: string; password: string },
  { rejectValue: string }
>("auth/signIn", async ({ email, password }, { rejectWithValue }) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const firebaseUser = userCredential.user;
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      phoneNumber: firebaseUser.phoneNumber,
      photoURL: firebaseUser.photoURL,
    };
  } catch (error) {
    const firebaseError = error as { code?: string; message?: string };
    let message = "Sign in failed";
    switch (firebaseError.code) {
      case "auth/invalid-credential":
        message = "Invalid credential. Please check your email and password.";
        break;
      case "auth/too-many-requests":
        message = "Too many requests. Please try again later.";
        break;
      case "auth/user-not-found":
        message = "No account found with this email.";
        break;
      case "auth/wrong-password":
        message = "Incorrect password.";
        break;
      case "auth/invalid-email":
        message = "Invalid email address.";
        break;
      default:
        message = firebaseError.message || "An error occurred during sign in.";
    }
    return rejectWithValue(message);
  }
});

export const signUp = createAsyncThunk<
  SerializableUser,
  { email: string; password: string },
  { rejectValue: string }
>("auth/signUp", async ({ email, password }, { rejectWithValue, dispatch }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const firebaseUser = userCredential.user;
    const userID = firebaseUser.uid;

    // Create the same Firestore document as businesses_creator does
    const result = await dispatch(
      firestoreApi.endpoints.createUserDocument.initiate({
        uid: userID,
        email,
      }),
    );

    if (result.error) {
      throw new Error(result.error as string);
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      phoneNumber: firebaseUser.phoneNumber,
      photoURL: firebaseUser.photoURL,
    };
  } catch (error) {
    const firebaseError = error as { code?: string; message?: string };
    let message = "Sign up failed";
    switch (firebaseError.code) {
      case "auth/email-already-in-use":
        message = "An account with this email already exists.";
        break;
      case "auth/weak-password":
        message = "Password should be at least 6 characters.";
        break;
      case "auth/invalid-email":
        message = "Invalid email address.";
        break;
      case "auth/too-many-requests":
        message = "Too many requests. Please try again later.";
        break;
      default:
        message = firebaseError.message || "An error occurred during sign up.";
    }
    return rejectWithValue(message);
  }
});

export const signOut = createAsyncThunk("auth/signOut", async () => {
  await firebaseSignOut(auth);
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setUser(state, action: PayloadAction<SerializableUser | null>) {
      if (action.payload) {
        state.user = action.payload;
      } else {
        state.user = null;
      }
      state.isAuthenticated = !!action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Sign In
    builder
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        signIn.fulfilled,
        (state, action: PayloadAction<SerializableUser>) => {
          state.isLoading = false;
          state.user = action.payload;
          state.isAuthenticated = true;
          state.error = null;
        },
      )
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Sign in failed";
      });

    // Sign Up
    builder
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        signUp.fulfilled,
        (state, action: PayloadAction<SerializableUser>) => {
          state.isLoading = false;
          state.user = action.payload;
          state.isAuthenticated = true;
          state.error = null;
        },
      )
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Sign up failed";
      });

    // Sign Out
    builder.addCase(signOut.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    });
  },
});

export const { clearError, setUser, setLoading } = authSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
