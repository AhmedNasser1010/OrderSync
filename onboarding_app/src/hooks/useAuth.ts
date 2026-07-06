"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import {
  signIn as signInThunk,
  signUp as signUpThunk,
  signOut as signOutThunk,
  clearError,
  setUser,
  setLoading,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  type SerializableUser,
} from "@/rtk/slices/authSlice";
import { auth, db } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { setAuthCookie, clearAuthCookie } from "@/lib/auth-cookie";
import { useFetchUserDataQuery } from "@/rtk/api/firestoreApi";

function toSerializableUser(firebaseUser: FirebaseUser): SerializableUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    phoneNumber: firebaseUser.phoneNumber,
    photoURL: firebaseUser.photoURL,
  };
}

export function useAuth(autoNavigate = true) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectAuthError);

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Use RTK Query to fetch user data from Firestore
  const { data: userData } = useFetchUserDataQuery(firebaseUser?.uid ?? "", {
    skip: !firebaseUser,
  });

  // Handle role check when user data is fetched via RTK Query
  useEffect(() => {
    if (!firebaseUser || !userData) return;

    const data = userData as { userInfo?: { role?: string } };
    const role = data.userInfo?.role;
    console.log("userData", userData);
    console.log(role);

    if (role !== "BUSINESSES_CREATOR") {
      // Role is not BUSINESSES_CREATOR - logout and redirect
      clearAuthCookie();
      dispatch(signOutThunk());
      dispatch(setUser(null));
      dispatch(setLoading(false));
      router.push("/auth/signup");
      return;
    }

    dispatch(setUser(toSerializableUser(firebaseUser)));
    dispatch(setLoading(false));
    setAuthCookie(firebaseUser.uid);
    if (autoNavigate) router.push("/restaurants");
  }, [firebaseUser, userData, dispatch, router, autoNavigate]);

  const onNotLoggedIn = useCallback(() => {
    dispatch(setUser(null));
    dispatch(setLoading(false));
    clearAuthCookie();
    if (autoNavigate) router.push("/auth/signup");
  }, [dispatch, router, autoNavigate]);

  const authListener = useCallback(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          setFirebaseUser(firebaseUser);
        } else {
          setFirebaseUser(null);
          onNotLoggedIn();
        }
      },
      () => {
        onNotLoggedIn();
      },
    );
    return unsubscribe;
  }, [onNotLoggedIn]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      dispatch(clearError());
      const result = await dispatch(signInThunk({ email, password }));
      if (signInThunk.rejected.match(result)) {
        throw new Error(result.payload ?? "Sign in failed");
      }
      // Set cookie as a fallback; the auth listener also handles this
      if (signInThunk.fulfilled.match(result)) {
        setAuthCookie(result.payload.uid);
      }
    },
    [dispatch],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      dispatch(clearError());
      const result = await dispatch(signUpThunk({ email, password }));
      if (signUpThunk.rejected.match(result)) {
        throw new Error(result.payload ?? "Sign up failed");
      }
      // Set cookie as a fallback; the auth listener also handles this
      if (signUpThunk.fulfilled.match(result)) {
        setAuthCookie(result.payload.uid);
      }
    },
    [dispatch],
  );

  const signInWithGoogle = useCallback(async () => {
    dispatch(clearError());

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const docSnapshot = await getDoc(userDocRef);

      if (!docSnapshot.exists()) {
        await setDoc(userDocRef, {
          joinDate: Date.now(),
          uid: firebaseUser.uid,
          userInfo: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: "BUSINESSES_CREATOR",
          },
          data: {
            businesses: [],
          },
        });
      }

      setAuthCookie(firebaseUser.uid);
    } catch (error) {
      const firebaseError = error as { message?: string; code?: string };
      const friendlyMessage =
        firebaseError.code === "auth/cancelled-popup-request" ||
        firebaseError.code === "auth/popup-closed-by-user"
          ? "Google sign in was canceled."
          : firebaseError.message || "Google sign in failed";
      throw new Error(friendlyMessage);
    }
  }, [dispatch]);

  const signOut = useCallback(async () => {
    clearAuthCookie();
    await dispatch(signOutThunk());
    router.push("/auth/signup");
  }, [dispatch, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    authListener,
  };
}

export function useRequireAuth() {
  const auth = useAuth(false);

  if (!auth.isAuthenticated && !auth.isLoading) {
    throw new Error("Not authenticated");
  }

  return auth;
}
