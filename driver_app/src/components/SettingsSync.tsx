"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "@/i18n/routing";
import { useFetchUserDataQuery } from "@/rtk/api/firestoreApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useAppDispatch } from "@/rtk/hooks";
import { setTheme } from "@/rtk/slices/toggleSlice";

export function SettingsSync() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const localeAppliedRef = useRef(false);

  const { data: userData } = useFetchUserDataQuery(
    user?.uid ? { uid: user.uid } : skipToken,
  );

  useEffect(() => {
    if (userData?.theme) {
      dispatch(setTheme(userData.theme));
    }
  }, [userData?.theme, dispatch]);

  useEffect(() => {
    if (!userData?.locale || localeAppliedRef.current) return;
    localeAppliedRef.current = true;
    if (userData.locale !== locale) {
      router.replace(pathname, { locale: userData.locale });
    }
  }, [userData?.locale, locale, pathname, router]);

  return null;
}
