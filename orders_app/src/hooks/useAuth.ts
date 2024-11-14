import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/rtk/hooks";
import { auth } from "@/lib/firebase";
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { useFetchUserDataQuery } from "@/rtk/api/firestoreApi";
import { userUid, setUserUid, setAccessToken } from "@/rtk/slices/constantsSlice";
import { isAuthLoadingStatus, setIsAuthLoading } from "@/rtk/slices/toggleSlice";

interface UseAuthReturn {
  user: FirebaseUser | null;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authError: any;
  authErrorMsg: string | null;
  authListener: () => Promise<FirebaseUser | null>;
}

const useAuth = (autoNavigate: boolean = true): UseAuthReturn => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const isAuthLoading = useAppSelector(isAuthLoadingStatus)
  const [authError, setAuthError] = useState<any>(null);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);
  const uid = useAppSelector(userUid);
  const { data: userFetchData } = useFetchUserDataQuery(uid, { skip: !uid });

  const onSuccessLogin = useCallback((userData?: FirebaseUser | null) => {
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
  }, [userFetchData]);

  const onFailedLogin = useCallback((error: any) => {
    dispatch(setIsAuthLoading(false));
    setAuthError(error);
    autoNavigate && router.push('./login')

    if (authError?.code) {
      switch (authError.code) {
        case "auth/invalid-credential":
          setAuthErrorMsg(
            "Invalid credential, Please check your email and password"
          );
          break;
        case "auth/too-many-requests":
          setAuthErrorMsg("Too many requests. Please try again later.");
          break;
        default:
          setAuthErrorMsg("An error occurred");
          console.error("An error occurred: ", authError);
          break;
      }
    }
  }, []);

  const onNotLoggedIn = useCallback(() => {
    router.push("./login");
    dispatch(setIsAuthLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    dispatch(setIsAuthLoading(true));
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      onSuccessLogin(userCredential.user);
    } catch (err) {
      onFailedLogin(err);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      location.reload()
    } catch (err) {
      location.reload()
      throw err;
    }
  };

  const authListener = (): Promise<FirebaseUser | null> => {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            onSuccessLogin(user)
            resolve(user);
          } else {
            onNotLoggedIn()
            resolve(null);
          }
        },
        (error) => {
          onFailedLogin(error)
          reject(error);
        }
      );
      return () => unsubscribe();
    });
  };

  return {
    user,
    isAuthLoading,
    login,
    logout,
    authError,
    authErrorMsg,
    authListener,
  };
};

export default useAuth;
