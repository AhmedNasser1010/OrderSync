"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useAppDispatch } from "@/rtk/hooks";
import { auth, db } from "@/lib/firebase";
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { setUserUid } from "@/rtk/slices/constantsSlice";
import customerSchema from "@/lib/customerSchema";

interface AuthContextValue {
  user: FirebaseUser | null;
  isAuthLoading: boolean;
  signInError: Error | null;
  signInWithGoogle: () => Promise<void>;
  ensureCustomerDocument: (data?: {
    name?: string;
    phone?: string;
    provider?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getAuthErrorCode(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null && "code" in err) {
    return (err as { code?: string }).code;
  }
  return undefined;
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [signInError, setSignInError] = useState<Error | null>(null);
  const redirectHandledRef = useRef(false);

  const ensureCustomerDocument = useCallback(
    async (data?: { name?: string; phone?: string; provider?: string }) => {
      const current = auth.currentUser;
      if (!current) return;

      const userDocRef = doc(db, "customers", current.uid);
      const docSnapshot = await getDoc(userDocRef);

      if (!docSnapshot.exists()) {
        const createUserData = customerSchema({
          uid: current.uid,
          name: data?.name || current.displayName || "",
          email: current.email || "",
          phone: data?.phone || current.phoneNumber || "",
          avatar: current.photoURL || "",
          provider: data?.provider || "Google",
        });
        await setDoc(userDocRef, createUserData);
      }
    },
    []
  );

  const handleRedirectResult = useCallback(async (): Promise<void> => {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        await ensureCustomerDocument({ provider: "Google" });
        dispatch(setUserUid(result.user.uid));
        setSignInError(null);
        setUser(result.user);
      }
    } catch (err: unknown) {
      const code = getAuthErrorCode(err);
      if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      setSignInError(err instanceof Error ? err : new Error(String(err)));
      console.error("Error completing Google sign in:", getErrorMessage(err));
    }
  }, [ensureCustomerDocument, dispatch]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setSignInError(null);
        dispatch(setUserUid(currentUser.uid));
        setUser(currentUser);
      } else {
        dispatch(setUserUid(null));
        setUser(null);
      }
      setIsAuthLoading(false);
    });

    if (!redirectHandledRef.current) {
      redirectHandledRef.current = true;
      void handleRedirectResult();
    }

    return () => unsubscribe();
  }, [dispatch, handleRedirectResult]);

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    const hostname =
      typeof window !== "undefined"
        ? window.location.hostname
        : typeof process !== "undefined" && process.env
          ? process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN || ""
          : "";
    const isLocalhost =
      hostname === "localhost" || hostname === "127.0.0.1";

    // Popup is only reliable when the auth iframe is same-origin (local dev).
    // On cross-origin hosts (e.g. Vercel) desktop browsers block the popup and
    // the third-party handshake, so use the full-page redirect instead.
    if (isLocalhost) {
      try {
        const result = await signInWithPopup(auth, provider);
        await ensureCustomerDocument({ provider: "Google" });
        setSignInError(null);
        setUser(result.user);
        return;
      } catch (err: unknown) {
        const code = getAuthErrorCode(err);
        if (
          code === "auth/popup-blocked" ||
          code === "auth/popup-closed-by-user" ||
          code === "auth/cancelled-popup-request"
        ) {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw err;
      }
    }

    await signInWithRedirect(auth, provider);
  }, [ensureCustomerDocument]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      window.location.reload();
    } catch (err) {
      window.location.reload();
      throw err;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthLoading,
        signInError,
        signInWithGoogle,
        ensureCustomerDocument,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
