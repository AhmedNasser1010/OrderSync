"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { setShowProfileIncompletePopup } from "@/rtk/slices/toggleSlice";

function ProfileIncompleteController() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);
  const isOnboardingComplete = useAppSelector(
    (state) => state.auth.isOnboardingComplete
  );

  useEffect(() => {
    if (status !== "authenticated") {
      dispatch(setShowProfileIncompletePopup(false));
      return;
    }

    if (isOnboardingComplete) {
      dispatch(setShowProfileIncompletePopup(false));
      return;
    }

    dispatch(setShowProfileIncompletePopup(true));
  }, [status, isOnboardingComplete, dispatch]);

  return null;
}

export default ProfileIncompleteController;
