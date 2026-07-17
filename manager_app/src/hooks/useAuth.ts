import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAppSelector, useAppDispatch } from "@/lib/rtk/hooks";
import { auth } from "@/lib/firebase";
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useFetchUserDataQuery } from "@/lib/rtk/api/firestoreApi";
import { userUid, setUserUid } from "@/lib/rtk/slices/constantsSlice";
import { skipToken } from "@reduxjs/toolkit/query";

interface UseAuthReturn {
  user: FirebaseUser | null;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  authError: any;
  authErrorMsg: string | null;
}

const useAuth = (autoNavigate: boolean = true): UseAuthReturn => {
  const t = useTranslations("Auth.errors");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<any>(null);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);
  const uid = useAppSelector(userUid);
  const mountedRef = useRef(true);
  const initialCheckDone = useRef(false);

  const { data: userFetchData } = useFetchUserDataQuery(uid ?? skipToken);

  // Role enforcement: only BUSINESS_MANAGER allowed in manager_app
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    user.getIdTokenResult().then((tokenResult) => {
      if (cancelled) return;

      const role = tokenResult.claims.role;
      if (role !== "BUSINESS_MANAGER") {
        firebaseSignOut(auth).then(() => location.reload());
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
    setAuthErrorMsg(null);
  }, []);

  const onFailedLogin = useCallback((error: any) => {
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
  }, []);

  // Single onAuthStateChanged listener on mount - the source of truth
  useEffect(() => {
    mountedRef.current = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (!mountedRef.current) return;

        if (currentUser) {
          const uid = currentUser.uid;
          dispatch(setUserUid(uid));
          setUser(currentUser);
          setIsAuthLoading(false);

          // Only navigate on initial auth check, not on every callback
          if (!initialCheckDone.current) {
            initialCheckDone.current = true;
            if (autoNavigate) {
              router.push("/");
            }
          }
        } else {
          setUser(null);
          dispatch(setUserUid(null));
          setIsAuthLoading(false);

          if (!initialCheckDone.current) {
            initialCheckDone.current = true;
            // Only redirect to login on initial load if autoNavigate is true (protected pages)
            if (autoNavigate) {
              router.push("/login");
            }
          } else {
            // User session ended during the session - redirect to login
            router.push("/login");
          }
        }
      },
      (error) => {
        if (!mountedRef.current) return;
        setIsAuthLoading(false);
        setAuthError(error);
        if (autoNavigate) {
          router.push("/login");
        }
      },
    );

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [autoNavigate, router, dispatch]);

  const login = async (email: string, password: string): Promise<void> => {
    clearAuthError();
    setIsAuthLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Immediately check role from custom claim before allowing login
      const tokenResult = await userCredential.user.getIdTokenResult();
      const role = tokenResult.claims.role;
      if (role !== "BUSINESS_MANAGER") {
        await firebaseSignOut(auth);
        setUser(null);
        dispatch(setUserUid(null));
        throw new Error(t("accessDenied"));
      }
      // Auth state will be updated by the onAuthStateChanged listener
    } catch (err: any) {
      onFailedLogin(err);
      throw err;
    }
  };

  const signup = async (email: string, password: string): Promise<void> => {
    clearAuthError();
    setIsAuthLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Auth state will be updated by the onAuthStateChanged listener
    } catch (err: any) {
      onFailedLogin(err);
    }
  };

  const signInWithGoogleFn = async (): Promise<void> => {
    clearAuthError();
    setIsAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Immediately check role from custom claim before allowing sign-in
      const tokenResult = await result.user.getIdTokenResult();
      const role = tokenResult.claims.role;
      if (role !== "BUSINESS_MANAGER") {
        await firebaseSignOut(auth);
        setUser(null);
        dispatch(setUserUid(null));
        throw new Error(t("accessDenied"));
      }
      // Auth state will be updated by the onAuthStateChanged listener
    } catch (err: any) {
      onFailedLogin(err);
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      // Auth state will be updated by the onAuthStateChanged listener
    } catch (err) {
      throw err;
    }
  };

  return {
    user,
    isAuthLoading,
    login,
    signup,
    signInWithGoogle: signInWithGoogleFn,
    logout,
    authError,
    authErrorMsg,
  };
};

export default useAuth;
