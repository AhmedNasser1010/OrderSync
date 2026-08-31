"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { auth, db } from "@/lib/firebase";
import {
  setAuthenticated,
  setUnauthenticated,
  setAuthLoading,
  setAuthError,
  setIdToken,
  setOnboardingComplete,
  clearAuthError,
  type AuthErrorInfo,
} from "@/rtk/slices/authSlice";
import customerSchema from "@/lib/customerSchema";
import { establishSession } from "@/app/actions/establishSession";
import { clearSession } from "@/app/actions/clearSession";

function getAuthErrorCode(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null && "code" in err) {
    return (err as { code?: string }).code;
  }
  return undefined;
}

function toAuthError(err: unknown): AuthErrorInfo {
  const code = getAuthErrorCode(err) || "auth/unknown";
  return { code, message: err instanceof Error ? err.message : String(err) };
}

export function useAuthSession() {
  const dispatch = useAppDispatch();
  const { status, uid, idToken, error, isOnboardingComplete } = useAppSelector(
    (state) => state.auth
  );
  const redirectHandledRef = useRef(false);
  const bootstrappedRef = useRef(false);

  const ensureCustomerDocument = useCallback(
    async (user: FirebaseUser, data?: { name?: string; phone?: string }) => {
      const userDocRef = doc(db, "customers", user.uid);
      const docSnapshot = await getDoc(userDocRef);

      if (!docSnapshot.exists()) {
        const createUserData = customerSchema({
          uid: user.uid,
          name: data?.name || user.displayName || "",
          email: user.email || "",
          phone: data?.phone || user.phoneNumber || "",
          avatar: user.photoURL || "",
          provider: "Google",
        });
        await setDoc(userDocRef, createUserData);
        dispatch(setOnboardingComplete(false));
        return;
      }

      // A doc already exists: onboarding is considered complete once the
      // essential contact + location fields are populated.
      const data2 = docSnapshot.data();
      const name = data2?.userInfo?.name;
      const phone = data2?.userInfo?.phone;
      const address = data2?.locations?.home?.address;
      const hasCoords = data2?.locations?.home?.latlng?.[0];
      const complete = !!(name && phone && address && hasCoords);
      dispatch(setOnboardingComplete(complete));
    },
    [dispatch]
  );

  const refreshTokenAndEstablishSession = useCallback(
    async (user: FirebaseUser) => {
      try {
        const token = await user.getIdToken();
        dispatch(setIdToken(token));
        void establishSession(token).catch(() => {
          // A failed session cookie should not break the client flow.
        });
      } catch {
        dispatch(setIdToken(null));
      }
    },
    [dispatch]
  );

  // Runs exactly once at app mount: binds the auth listener and resolves any
  // pending redirect result from a previous full-page sign-in.
  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(clearAuthError());
        dispatch(setAuthenticated({ uid: user.uid, idToken: null }));
        void ensureCustomerDocument(user);
        void refreshTokenAndEstablishSession(user);
      } else {
        dispatch(setUnauthenticated());
      }
    });

    if (!redirectHandledRef.current) {
      redirectHandledRef.current = true;
      void (async () => {
        try {
          const result = await getRedirectResult(auth);
          if (result?.user) {
            dispatch(clearAuthError());
            dispatch(
              setAuthenticated({ uid: result.user.uid, idToken: null })
            );
            await ensureCustomerDocument(result.user);
            await refreshTokenAndEstablishSession(result.user);
          }
        } catch (err) {
          const code = getAuthErrorCode(err);
          if (
            code === "auth/popup-closed-by-user" ||
            code === "auth/cancelled-popup-request" ||
            code === "auth/popup-blocked"
          ) {
            return;
          }
          dispatch(setAuthError(toAuthError(err)));
        }
      })();
    }

    return () => unsubscribe();
  }, [dispatch, ensureCustomerDocument, refreshTokenAndEstablishSession]);

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    dispatch(setAuthLoading());
    const provider = new GoogleAuthProvider();

    // Popup is preferred everywhere. Unlike signInWithRedirect, the popup flow
    // does not rely on a cross-origin iframe on the Firebase auth domain, so it
    // works on any HTTPS origin (localhost, ngrok tunnels, custom domains)
    // even when browsers block third-party storage access.
    try {
      const result = await signInWithPopup(auth, provider);
      dispatch(clearAuthError());
      dispatch(setAuthenticated({ uid: result.user.uid, idToken: null }));
      await ensureCustomerDocument(result.user);
      await refreshTokenAndEstablishSession(result.user);
      return;
    } catch (err) {
      const code = getAuthErrorCode(err);
      if (
        code === "auth/popup-blocked" ||
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        dispatch(
          setAuthError({
            code: code ?? "auth/popup-blocked",
            message:
              "Google sign-in needs popups enabled in this browser. The redirect fallback is disabled because it is unreliable in production on this deployment.",
          })
        );
        throw err;
      }
      dispatch(setAuthError(toAuthError(err)));
      throw err;
    }
  }, [dispatch, ensureCustomerDocument, refreshTokenAndEstablishSession]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await clearSession();
      await firebaseSignOut(auth);
    } finally {
      dispatch(setUnauthenticated());
      window.location.reload();
    }
  }, [dispatch]);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    const token = await currentUser.getIdToken();
    dispatch(setIdToken(token));
    return token;
  }, [dispatch]);

  return {
    status,
    uid,
    idToken,
    error,
    isOnboardingComplete,
    isAuthenticated: status === "authenticated",
    isAuthLoading: status === "loading",
    signInWithGoogle,
    logout,
    getIdToken,
    ensureCustomerDocument,
    refreshToken: refreshTokenAndEstablishSession,
  };
}
