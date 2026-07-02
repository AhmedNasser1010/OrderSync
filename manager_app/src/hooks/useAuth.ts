import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/rtk/hooks";
import { auth } from "@/lib/firebase";
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { useFetchUserDataQuery } from "@/lib/rtk/api/firestoreApi";
import { userUid, setUserUid } from "@/lib/rtk/slices/constantsSlice";
import { skipToken } from "@reduxjs/toolkit/query";

interface UseAuthReturn {
  user: FirebaseUser | null;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authError: any;
  authErrorMsg: string | null;
}

const useAuth = (autoNavigate: boolean = true): UseAuthReturn => {
  const router = useRouter()
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<any>(null)
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null)
  const uid = useAppSelector(userUid);
  const mountedRef = useRef(true);
  const initialCheckDone = useRef(false);
  
  useFetchUserDataQuery(uid ?? skipToken);
  
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
        case 'auth/invalid-credential':
          msg = 'Invalid credential, Please check your email and password';
          break;
        case 'auth/too-many-requests':
          msg = 'Too many requests. Please try again later.';
          break;
        case 'auth/email-already-in-use':
          msg = 'This email is already in use.';
          break;
        case 'auth/weak-password':
          msg = 'Password should be at least 6 characters.';
          break;
        default:
          msg = 'An error occurred';
          console.error('An error occurred: ', error);
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
              router.push('/');
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
              router.push('./login');
            }
          } else {
            // User session ended during the session - redirect to login
            router.push('./login');
          }
        }
      },
      (error) => {
        if (!mountedRef.current) return;
        setIsAuthLoading(false);
        setAuthError(error);
        if (autoNavigate) {
          router.push('./login');
        }
      }
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
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state will be updated by the onAuthStateChanged listener
    } catch (err: any) {
      onFailedLogin(err);
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

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
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
    logout,
    authError,
    authErrorMsg
  };
};

export default useAuth;