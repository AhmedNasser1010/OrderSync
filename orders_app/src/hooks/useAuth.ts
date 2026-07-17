import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/rtk/hooks";
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
import { useFetchUserDataQuery } from "@/rtk/api/firestoreApi";
import {
  userUid,
  setUserUid,
  setAccessToken,
} from "@/rtk/slices/constantsSlice";
import {
  isAuthLoadingStatus,
  setIsAuthLoading,
} from "@/rtk/slices/toggleSlice";
import { skipToken } from "@reduxjs/toolkit/query";

interface UseAuthReturn {
  user: FirebaseUser | null;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  authError: Error | null;
  authErrorMsg: string | null;
  authListener: () => Promise<FirebaseUser | null>;
}

const useAuth = (autoNavigate: boolean = true): UseAuthReturn => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const isAuthLoading = useAppSelector(isAuthLoadingStatus);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);
  const uid = useAppSelector(userUid);
  const { data: userFetchData } = useFetchUserDataQuery(uid ?? skipToken);

  // Role enforcement: only BUSINESS_MANAGER allowed in orders_app
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

  const onSuccessLogin = useCallback(
    (userData?: FirebaseUser | null) => {
      if (userData) {
        const uid = userData.uid;
        dispatch(setUserUid(uid));
        setUser(userData);

        if (userFetchData) {
          dispatch(setAccessToken(userFetchData.accessToken));
          dispatch(setIsAuthLoading(false));
          autoNavigate && router.push("/");
        }
      }
    },
    [userFetchData],
  );

  const onFailedLogin = useCallback((error: unknown) => {
    dispatch(setIsAuthLoading(false));
    setAuthError(error instanceof Error ? error : new Error(String(error)));
    autoNavigate && router.push("./login");

    const err = error as { code?: string } | null;
    if (err?.code) {
      switch (err.code) {
        case "auth/invalid-credential":
          setAuthErrorMsg(
            "Invalid credential, Please check your email and password",
          );
          break;
        case "auth/too-many-requests":
          setAuthErrorMsg("Too many requests. Please try again later.");
          break;
        default:
          setAuthErrorMsg("An error occurred");
          console.error("An error occurred: ", error);
          break;
      }
    }
  }, []);

  const onNotLoggedIn = useCallback(() => {
    if (autoNavigate) {
      router.push("./login");
    }
    dispatch(setIsAuthLoading(false));
  }, [autoNavigate]);

  const login = async (email: string, password: string): Promise<void> => {
    dispatch(setIsAuthLoading(true));
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Immediately check role from custom claim before allowing login
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

      onSuccessLogin(userCredential.user);
    } catch (err) {
      onFailedLogin(err);
      throw err;
    }
  };

  const signup = async (email: string, password: string): Promise<void> => {
    dispatch(setIsAuthLoading(true));
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      onSuccessLogin(userCredential.user);
    } catch (err) {
      onFailedLogin(err);
    }
  };

  const signInWithGoogleFn = async (): Promise<void> => {
    dispatch(setIsAuthLoading(true));
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
        throw new Error(
          "Access denied. Only business managers can access this app.",
        );
      }

      onSuccessLogin(result.user);
    } catch (err) {
      const firebaseError = err as { message?: string; code?: string };
      const friendlyMessage =
        firebaseError.code === "auth/cancelled-popup-request" ||
        firebaseError.code === "auth/popup-closed-by-user"
          ? "Google sign in was canceled."
          : firebaseError.message || "Google sign in failed";
      onFailedLogin(new Error(friendlyMessage));
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      location.reload();
    } catch (err) {
      location.reload();
      throw err;
    }
  };

  const authListener = useCallback((): Promise<FirebaseUser | null> => {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            onSuccessLogin(user);
            resolve(user);
          } else {
            onNotLoggedIn();
            resolve(null);
          }
        },
        (error) => {
          onFailedLogin(error);
          reject(error);
        },
      );
      return () => unsubscribe();
    });
  }, [onSuccessLogin, onNotLoggedIn, onFailedLogin]);

  return {
    user,
    isAuthLoading,
    login,
    signup,
    signInWithGoogle: signInWithGoogleFn,
    logout,
    authError,
    authErrorMsg,
    authListener,
  };
};

export default useAuth;
