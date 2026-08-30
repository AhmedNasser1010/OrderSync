"use client";

import { useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useAppDispatch } from "@/rtk/hooks";
import { db } from "@/lib/firebase";
import { initUser, clearUser } from "@/rtk/slices/userSlice";
import { useAuthSession } from "@/hooks/useAuthSession";

export function useCustomerSync() {
  const dispatch = useAppDispatch();
  const { uid } = useAuthSession();

  useEffect(() => {
    if (!uid) {
      dispatch(clearUser());
      return;
    }

    const userRef = doc(db, "customers", uid);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          dispatch(initUser(docSnapshot.data()));
        } else {
          dispatch(clearUser());
        }
      },
      (error) => {
        console.error("Error in real-time listener [customers]:", error?.message);
      }
    );

    return () => unsubscribe();
  }, [uid, dispatch]);
}
