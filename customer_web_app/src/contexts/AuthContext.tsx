"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

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

    return () => unsubscribe();
  }, [dispatch]);

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

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await ensureCustomerDocument({ provider: "Google" });
    setUser(result.user);
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
