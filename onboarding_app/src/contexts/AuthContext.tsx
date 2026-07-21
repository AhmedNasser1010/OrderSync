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
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/rtk/hooks";
import { auth, db } from "@/lib/firebase";
import {
  type User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { setUserUid } from "@/rtk/slices/constantsSlice";
import { setAuthCookie, clearAuthCookie } from "@/lib/auth-cookie";
import { setUserRoleClaim } from "@/app/actions/setUserRoleClaim";

interface AuthContextValue {
  user: FirebaseUser | null;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  authError: Error | null;
  authErrorMsg: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const initialCheckDone = useRef(false);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
    setAuthErrorMsg(null);
  }, []);

  const onFailedLogin = useCallback((error: { code?: string; message?: string }) => {
    setIsAuthLoading(false);
    setAuthError(new Error(error.message || "An error occurred"));

    let msg: string | null = null;
    if (error?.code) {
      switch (error.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          msg = "Invalid credential. Please check your email and password.";
          break;
        case "auth/too-many-requests":
          msg = "Too many requests. Please try again later.";
          break;
        case "auth/email-already-in-use":
          msg = "An account with this email already exists.";
          break;
        case "auth/weak-password":
          msg = "Password should be at least 6 characters.";
          break;
        case "auth/cancelled-popup-request":
        case "auth/popup-closed-by-user":
          msg = "Google sign in was canceled.";
          break;
        default:
          msg = "An error occurred.";
          console.error("An error occurred: ", error);
          break;
      }
    }
    setAuthErrorMsg(msg);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!mountedRef.current) return;

        if (currentUser) {
          const tokenResult = await currentUser.getIdTokenResult();
          const role = tokenResult.claims.role;

          if (role !== "BUSINESSES_CREATOR") {
            await firebaseSignOut(auth);
            dispatch(setUserUid(null));
            clearAuthCookie();
            setUser(null);
            setIsAuthLoading(false);
            if (!initialCheckDone.current) {
              initialCheckDone.current = true;
              router.push("/auth/signup");
            }
            return;
          }

          dispatch(setUserUid(currentUser.uid));
          setAuthCookie(currentUser.uid);
          setUser(currentUser);
          setIsAuthLoading(false);

          if (!initialCheckDone.current) {
            initialCheckDone.current = true;
            router.push("/restaurants");
          }
        } else {
          dispatch(setUserUid(null));
          clearAuthCookie();
          setUser(null);
          setIsAuthLoading(false);

          if (!initialCheckDone.current) {
            initialCheckDone.current = true;
            router.push("/auth/signup");
          } else {
            router.push("/auth/signup");
          }
        }
      },
      (error) => {
        if (!mountedRef.current) return;
        setIsAuthLoading(false);
        setAuthError(error);
        router.push("/auth/signup");
      },
    );

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [router, dispatch]);

  const login = async (email: string, password: string): Promise<void> => {
    clearAuthError();
    setIsAuthLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const tokenResult = await userCredential.user.getIdTokenResult();
      const role = tokenResult.claims.role;
      if (role !== "BUSINESSES_CREATOR") {
        await firebaseSignOut(auth);
        setUser(null);
        dispatch(setUserUid(null));
        clearAuthCookie();
        throw new Error(
          "Access denied. Only businesses creators can access this app.",
        );
      }
    } catch (err: unknown) {
      const firebaseErr = err as { message?: string; code?: string };
      if (firebaseErr?.message?.includes("Access denied")) {
        setIsAuthLoading(false);
        setAuthError(err as Error);
        setAuthErrorMsg(firebaseErr.message);
        throw err;
      }
      onFailedLogin(firebaseErr);
      throw err;
    }
  };

  const signup = async (email: string, password: string): Promise<void> => {
    clearAuthError();
    setIsAuthLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;
      const uid = firebaseUser.uid;

      await setDoc(doc(db, "users", uid), {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        uid,
        userInfo: {
          uid,
          email,
          role: "BUSINESSES_CREATOR",
          provider: "Email/Password",
        },
        data: {
          uid,
          businesses: [],
        },
      });
      await setUserRoleClaim(uid, "BUSINESSES_CREATOR");
      await firebaseUser.getIdToken(true);

      const tokenResult = await firebaseUser.getIdTokenResult();
      const role = tokenResult.claims.role;

      if (role !== "BUSINESSES_CREATOR") {
        await firebaseSignOut(auth);
        setUser(null);
        dispatch(setUserUid(null));
        clearAuthCookie();
        throw new Error(
          "Access denied. Only businesses creators can access this app.",
        );
      }
    } catch (err: unknown) {
      const firebaseErr = err as { message?: string; code?: string };
      if (firebaseErr?.message?.includes("Access denied")) {
        setIsAuthLoading(false);
        setAuthError(err as Error);
        setAuthErrorMsg(firebaseErr.message);
        throw err;
      }
      onFailedLogin(firebaseErr);
      throw err;
    }
  };

  const signInWithGoogleFn = async (): Promise<void> => {
    clearAuthError();
    setIsAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      const userDocRef = doc(db, "users", googleUser.uid);
      const docSnapshot = await getDoc(userDocRef);

      if (!docSnapshot.exists()) {
        await setDoc(userDocRef, {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          uid: googleUser.uid,
          userInfo: {
            uid: googleUser.uid,
            email: googleUser.email,
            role: "BUSINESSES_CREATOR",
            provider: "Google",
          },
          data: {
            uid: googleUser.uid,
            businesses: [],
          },
        });
        await setUserRoleClaim(googleUser.uid, "BUSINESSES_CREATOR");
        await googleUser.getIdToken(true);
      }

      const tokenResult = await googleUser.getIdTokenResult();
      const role = tokenResult.claims.role;

      if (role !== "BUSINESSES_CREATOR") {
        await firebaseSignOut(auth);
        setUser(null);
        dispatch(setUserUid(null));
        clearAuthCookie();
        throw new Error(
          "Access denied. Only businesses creators can access this app.",
        );
      }
    } catch (err: unknown) {
      const firebaseErr = err as { message?: string; code?: string };
      if (firebaseErr?.message?.includes("Access denied")) {
        setIsAuthLoading(false);
        setAuthError(err as Error);
        setAuthErrorMsg(firebaseErr.message);
        throw err;
      }

      const friendlyMessage =
        firebaseErr.code === "auth/cancelled-popup-request" ||
        firebaseErr.code === "auth/popup-closed-by-user"
          ? "Google sign in was canceled."
          : firebaseErr.message || "Google sign in failed";
      onFailedLogin(new Error(friendlyMessage));
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      clearAuthCookie();
      await firebaseSignOut(auth);
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthLoading,
        login,
        signup,
        signInWithGoogle: signInWithGoogleFn,
        logout,
        authError,
        authErrorMsg,
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
