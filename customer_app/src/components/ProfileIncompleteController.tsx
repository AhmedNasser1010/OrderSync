"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { setShowProfileIncompletePopup } from "@/rtk/slices/toggleSlice";

const DISMISSED_KEY = "zajil-profile-popup-dismissed";

function ProfileIncompleteController() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);
  const isOnboardingComplete = useAppSelector(
    (state) => state.auth.isOnboardingComplete
  );
  const appliedOnceRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") {
      dispatch(setShowProfileIncompletePopup(false));
      appliedOnceRef.current = false;
      return;
    }

    if (appliedOnceRef.current) return;
    appliedOnceRef.current = true;

    if (isOnboardingComplete) return;

    let dismissed = false;
    try {
      dismissed =
        typeof window !== "undefined" &&
        window.sessionStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      dismissed = false;
    }

    if (!dismissed) {
      dispatch(setShowProfileIncompletePopup(true));
    }
  }, [status, isOnboardingComplete, dispatch]);

  return null;
}

export default ProfileIncompleteController;
