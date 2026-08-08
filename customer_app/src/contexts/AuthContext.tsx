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
      console.error("Error completing Google sign in:", getErrorMessage(err));
    }
  }, [ensureCustomerDocument]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
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
    try {
      const result = await signInWithPopup(auth, provider);
      await ensureCustomerDocument({ provider: "Google" });
      setUser(result.user);
    } catch (err: unknown) {
      const code = getAuthErrorCode(err);
      if (code === "auth/popup-blocked") {
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectErr: unknown) {
          console.error(
            "Error starting Google sign in redirect:",
            getErrorMessage(redirectErr)
          );
          throw redirectErr;
        }
        return;
      }
      if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      throw err;
    }
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
