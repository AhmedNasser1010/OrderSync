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
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAppDispatch } from "@/lib/rtk/hooks";
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
import { doc, getDoc } from "firebase/firestore";
import { setUserUid } from "@/lib/rtk/slices/constantsSlice";
import { setUserRoleClaim } from "@/app/actions/setUserRoleClaim";

interface AuthContextValue {
  user: FirebaseUser | null;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  authError: any;
  authErrorMsg: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("Auth.errors");
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<any>(null);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const initialCheckDone = useRef(false);
  const isSigningUp = useRef(false);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
    setAuthErrorMsg(null);
  }, []);

  const onFailedLogin = useCallback(
    (error: any) => {
      setIsAuthLoading(false);
      setAuthError(error);

      let msg: string | null = null;
      if (error?.code) {
        switch (error.code) {
          case "auth/invalid-credential":
          case "auth/user-not-found":
          case "auth/wrong-password":
            msg = t("invalidCredential");
            break;
          case "auth/too-many-requests":
            msg = t("tooManyRequests");
            break;
          case "auth/email-already-in-use":
            msg = t("emailAlreadyInUse");
            break;
          case "auth/weak-password":
            msg = t("weakPassword");
            break;
          case "auth/cancelled-popup-request":
          case "auth/popup-closed-by-user":
            msg = t("googleSignInCanceled");
            break;
          default:
            msg = t("anErrorOccurred");
            console.error("An error occurred: ", error);
            break;
        }
      }
      setAuthErrorMsg(msg);
    },
    [t],
  );

  useEffect(() => {
    mountedRef.current = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!mountedRef.current) return;

        if (currentUser) {
          const tokenResult = await currentUser.getIdTokenResult();
          const role = tokenResult.claims.role;

          if (role !== "BUSINESS_MANAGER") {
            if (!isSigningUp.current) {
              await firebaseSignOut(auth);
              dispatch(setUserUid(null));
              setUser(null);
              setIsAuthLoading(false);
              if (!initialCheckDone.current) {
                initialCheckDone.current = true;
                router.push("/login");
              }
            }
            return;
          }

          dispatch(setUserUid(currentUser.uid));
          setUser(currentUser);
          setIsAuthLoading(false);

          if (!initialCheckDone.current) {
            initialCheckDone.current = true;
            router.push("/");
          }
        } else {
          dispatch(setUserUid(null));
          setUser(null);
          setIsAuthLoading(false);

          if (!initialCheckDone.current) {
            initialCheckDone.current = true;
            router.push("/login");
          } else {
            router.push("/login");
          }
        }
      },
      (error) => {
        if (!mountedRef.current) return;
        setIsAuthLoading(false);
        setAuthError(error);
        router.push("/login");
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
      if (role !== "BUSINESS_MANAGER") {
        await firebaseSignOut(auth);
        setUser(null);
        dispatch(setUserUid(null));
        throw new Error(
          "Access denied. Only business managers can access this app.",
        );
      }
    } catch (err: any) {
      if (err?.message?.includes("Access denied")) {
        setIsAuthLoading(false);
        setAuthError(err);
        setAuthErrorMsg(err.message);
        throw err;
      }
      onFailedLogin(err);
      throw err;
    }
  };

  const signup = async (email: string, password: string): Promise<void> => {
    clearAuthError();
    setIsAuthLoading(true);
    isSigningUp.current = true;
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;
      const uid = firebaseUser.uid;

      const result = await setUserRoleClaim(uid, "BUSINESS_MANAGER");
      if (!result.success) {
        throw new Error(result.error || "Failed to set role claim");
      }

      await firebaseUser.getIdToken(true);

      const tokenResult = await firebaseUser.getIdTokenResult();
      const role = tokenResult.claims.role;

      if (role !== "BUSINESS_MANAGER") {
        await firebaseSignOut(auth);
        setUser(null);
        dispatch(setUserUid(null));
        throw new Error(
          "Access denied. Only business managers can access this app.",
        );
      }

      dispatch(setUserUid(firebaseUser.uid));
      setUser(firebaseUser);
      setIsAuthLoading(false);
      initialCheckDone.current = true;
      router.push("/");
    } catch (err: any) {
      if (err?.message?.includes("Access denied")) {
        setIsAuthLoading(false);
        setAuthError(err);
        setAuthErrorMsg(err.message);
        throw err;
      }
      onFailedLogin(err);
      throw err;
    } finally {
      isSigningUp.current = false;
    }
  };

  const signInWithGoogleFn = async (): Promise<void> => {
    clearAuthError();
    setIsAuthLoading(true);
    isSigningUp.current = true;
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      const userDocRef = doc(db, "users", googleUser.uid);
      const docSnapshot = await getDoc(userDocRef);

      if (!docSnapshot.exists()) {
        const claimResult = await setUserRoleClaim(
          googleUser.uid,
          "BUSINESS_MANAGER",
        );
        if (!claimResult.success) {
          throw new Error(claimResult.error || "Failed to set role claim");
        }

        await googleUser.getIdToken(true);

        const tokenResult = await googleUser.getIdTokenResult();
        const role = tokenResult.claims.role;

        if (role !== "BUSINESS_MANAGER") {
          await firebaseSignOut(auth);
          setUser(null);
          dispatch(setUserUid(null));
          throw new Error(
            "Access denied. Only business managers can access this app.",
          );
        }
      } else {
        const tokenResult = await googleUser.getIdTokenResult();
        const role = tokenResult.claims.role;

        if (role !== "BUSINESS_MANAGER") {
          await firebaseSignOut(auth);
          setUser(null);
          dispatch(setUserUid(null));
          throw new Error(
            "Access denied. Only business managers can access this app.",
          );
        }
      }
    } catch (err: any) {
      if (err?.message?.includes("Access denied")) {
        setIsAuthLoading(false);
        setAuthError(err);
        setAuthErrorMsg(err.message);
        throw err;
      }

      const firebaseError = err as { message?: string; code?: string };
      const friendlyMessage =
        firebaseError.code === "auth/cancelled-popup-request" ||
        firebaseError.code === "auth/popup-closed-by-user"
          ? "Google sign in was canceled."
          : firebaseError.message || "Google sign in failed";
      onFailedLogin(new Error(friendlyMessage));
      throw err;
    } finally {
      isSigningUp.current = false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
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
