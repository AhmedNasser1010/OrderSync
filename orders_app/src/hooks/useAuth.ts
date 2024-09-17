import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/rtk/hooks";
import { auth } from "@/lib/firebase";
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { useFetchUserDataQuery } from "@/lib/rtk/api/firestoreApi";
import { userUid, setUserUid } from "@/lib/rtk/slices/constantsSlice";

interface UseAuthReturn {
  user: FirebaseUser | null;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
  useFetchUserDataQuery(uid, { skip: !uid });
  
  const onSuccessLogin = (userData?: FirebaseUser | null) => {
    if (userData) {
      const uid = userData.uid;
      
      dispatch(setUserUid(uid));
      setUser(userData);
      setIsAuthLoading(false);
      autoNavigate && router.push('/');
    }
  }

  const onFailedLogin = (error: any) => {
    setIsAuthLoading(false);
    setAuthError(error);

    if (authError?.code) {
      switch (authError.code) {
        case 'auth/invalid-credential':
          setAuthErrorMsg('Invalid credential, Please check your email and password')
          break;
        case 'auth/too-many-requests':
          setAuthErrorMsg('Too many requests. Please try again later.')
          break;
        default:
          setAuthErrorMsg('An error occurred')
          console.error('An error occurred: ', authError)
          break;
      }
    }
  }

  const login = async (email: string, password: string): Promise<void> => {
    setIsAuthLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      onSuccessLogin(userCredential.user)
    } catch (err) {
      onFailedLogin(err)
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (err) {
      throw err;
    }
  };

  const getCurrentUser = (): Promise<FirebaseUser | null> => {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            resolve(user);
          } else {
            resolve(null);
          }
        },
        reject
      );
      return () => unsubscribe();
    });
  };

  useEffect(() => {
    getCurrentUser()
      .then((currentUser) => {
        if (currentUser) {
          onSuccessLogin(currentUser)
          return
        }
          router.push('./login')
          setIsAuthLoading(false)
      })
      .catch((error) => {
        router.push('./login')
        onFailedLogin(error)
      });
  }, []);

  return {
    user,
    isAuthLoading,
    login,
    logout,
    authError,
    authErrorMsg
  };
};

export default useAuth;
