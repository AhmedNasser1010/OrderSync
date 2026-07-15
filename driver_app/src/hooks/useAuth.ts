import { auth } from "@/lib/firebase";
import { useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as signOutFirebase,
} from "firebase/auth";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import {
  setAuthError,
  setInitialized,
  setIsLoading,
  setIsOnboarded,
  setProviderData,
  setAuthMethod,
  setUser,
  selectIsLoading,
  selectUser,
  selectIsOnboarded,
  selectProviderData,
  selectError,
} from "../rtk/slices/authSlice";
import {
  useFetchUserDataQuery,
  useLazyFetchDriverProfileQuery,
} from "../rtk/api/firestoreApi";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isLoading = useAppSelector(selectIsLoading);
  const isOnboarded = useAppSelector(selectIsOnboarded);
  const providerData = useAppSelector(selectProviderData);
  const error = useAppSelector(selectError);

  const {
    data: userData,
    isLoading: isFetchUserDataLoading,
    isError,
    refetch: refetchUserData,
  } = useFetchUserDataQuery(user!, {
    skip: !user,
  });

  const [
    fetchDriverProfile,
    {
      data: driverProfile,
      isLoading: isFetchDriverProfileLoading,
      error: fetchDriverProfileError,
      isError: isFetchDriverProfileError,
    },
  ] = useLazyFetchDriverProfileQuery();

  const signInWithGoogle = async () => {
    const provider = new (await import("firebase/auth")).GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const providerData = user.providerData[0];

      dispatch(setAuthMethod("google"));

      dispatch(
        setProviderData({
          uid: user.uid,
          email: providerData?.email ?? "",
          name: providerData?.displayName ?? "",
          phone: providerData?.phoneNumber ?? "",
          role: "DRIVER",
          provider: "google.com",
        })
      );

      dispatch(setAuthError(null));
    } catch (error: any) {
      dispatch(setAuthMethod(null));
      dispatch(setAuthError(error.message));
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const provider = userCredential.user.providerData[0]?.providerId;
      dispatch(setAuthMethod("email"));
      dispatch(
        setProviderData({
          uid: userCredential.user.uid,
          email: userCredential.user.email!,
          name: userCredential.user.displayName ?? "",
          phone: userCredential.user.phoneNumber ?? "",
          role: "DRIVER",
          provider: provider ?? "",
        })
      );

      dispatch(setAuthError(null));
    } catch (error: any) {
      dispatch(setAuthError(error.message));
      dispatch(setAuthMethod(null));
    }
  };

  const signIn = signInWithEmail;

  const signOut = async () => {
    try {
      await signOutFirebase(auth);
      dispatch(setIsLoading(false));
    } catch (error: any) {
      console.error("Error signing out: ", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch(setInitialized());
      if (user) {
        dispatch(setUser(user ? { uid: user.uid, email: user.email } : null));
        dispatch(setIsLoading(true));
        fetchDriverProfile(user.uid)
          .unwrap()
          .then(() => {
            dispatch(setIsOnboarded(true));
          })
          .catch((error) => {
            const msg = typeof error === "string" ? error : error?.message ?? "";
            if (msg === "Driver not found") {
              dispatch(setIsOnboarded(false));
            } else {
              dispatch(setIsOnboarded(false));
              console.error("Error fetching driver profile:", msg);
            }
          })
          .finally(() => {
            dispatch(setIsLoading(false));
          });
      } else {
        dispatch(setUser(null));
        dispatch(setIsOnboarded(false));
        dispatch(setProviderData(initialProviderData));
        dispatch(setAuthMethod(null));
      }
    });

    return () => unsubscribe();
  }, [dispatch, fetchDriverProfile]);

  return {
    user,
    isLoading: isFetchUserDataLoading || isFetchDriverProfileLoading,
    isOnboarded,
    providerData,
    isFetchDriverProfileError,
    isFetchUserDataError: isError,
    driverProfileError: fetchDriverProfileError,
    fetchDriverProfileError,
    driverProfile,
    userData,
    signIn,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    refetchUserData,
    error,
  };
};

const initialProviderData = {
  uid: "",
  email: "",
  name: "",
  phone: "",
  role: "DRIVER" as const,
  provider: "",
};
