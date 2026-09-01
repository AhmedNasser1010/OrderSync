"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import {
  XIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  LogOutIcon,
  ChevronDownIcon,
  UserRoundIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { toggleLoginSidebar, toggleLng } from "@/rtk/slices/toggleSlice";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useRouter } from "@/i18n/routing";
import { LOGO_URL } from "@/utils/constants";
import ProfileAvatar from "@/components/Sidebar/ProfileAvatar";
import { cn } from "@/lib/utils";

const LoginSidebar = () => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoginSidebarOpen = useAppSelector(
    (state) => state.toggle.isLoginSidebarOpen
  );
  const user = useAppSelector((state) => state.user);
  const lng = useAppSelector((state) => state.toggle.lng);
  const { isAuthenticated, logout, isOnboardingComplete } = useAuthSession();

  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    if (!confirmLogout) return;
    const timer = setTimeout(() => setConfirmLogout(false), 5000);
    return () => clearTimeout(timer);
  }, [confirmLogout]);

  const changeLanguage = (lng: string) => {
    router.replace("/", { locale: lng });
    dispatch(toggleLng(lng));
  };

  const handleCloseSidebar = () => {
    dispatch(toggleLoginSidebar());
    document.body.classList.remove("overflow-hidden");
    setConfirmLogout(false);
  };

  useEffect(() => {
    if (!isLoginSidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseSidebar();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoginSidebarOpen]);

  const handleLogout = async () => {
    await logout();
    handleCloseSidebar();
  };

  const handleGoToSignin = () => {
    handleCloseSidebar();
    router.push("/signin");
  };

  const handleGoToOnboarding = () => {
    handleCloseSidebar();
    router.push("/onboarding");
  };

  const isRTL = locale === "ar";

  const avatarUrl = (user?.userInfo as { avatar?: string } | undefined)?.avatar;

  const pillPosition =
    (lng === "ar") === isRTL ? "left-1.5" : "right-1.5";

  return (
    <>
      <div
        className={cn(
          "login-sidebar fixed top-0 h-full overflow-y-scroll bg-card transition-all duration-500 z-40 px-5 py-5 w-full sm:px-8 sm:py-6 flex flex-col sm:w-[420px]",
          isRTL ? "left-0" : "right-0",
          isLoginSidebarOpen
            ? "translate-x-0"
            : isRTL
              ? "-translate-x-full"
              : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-2">
            <Image src={LOGO_URL} alt="logo" width={36} height={36} className="h-9 w-9 object-contain" />
            <span className="font-Beiruti text-2xl text-color-1">
              {t("Zajil")}
            </span>
          </div>
          <button
            onClick={handleCloseSidebar}
            aria-label={t("Close")}
            className="size-9 grid place-items-center rounded-full bg-color-7/60 hover:bg-color-7 transition-colors cursor-pointer"
          >
            <XIcon className="size-5 text-color-1" />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="flex-1">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-color-2 via-[#ff8c3b] to-[#ffab4a] p-6 text-white mb-6 shadow-lg shadow-color-2/25">
              <div className="absolute -end-6 -top-8 size-28 rounded-full bg-white/15" />
              <div className="absolute -end-0 top-2 size-14 rounded-full bg-white/10" />
              <div className="relative">
                <p className="text-[11px] font-ProximaNovaThin uppercase tracking-widest opacity-90">
                  {t("Welcome")}
                </p>
                <h2 className="font-ProximaNovaBold text-3xl mt-1 leading-tight">
                  {t("Login")}
                </h2>
                <p className="font-ProximaNovaThin text-sm text-white/90 mt-1">
                  {t("and")}{" "}
                  <span className="font-ProximaNovaSemiBold">
                    {t("Enjoy your time")}
                  </span>
                </p>
              </div>
            </div>

            {/* Google sign-in redirect */}
            <button
              type="button"
              onClick={handleGoToSignin}
              className="group w-full flex items-center justify-center gap-3 rounded-2xl border border-color-7 bg-card py-4 px-4 text-base font-ProximaNovaSemiBold text-color-1 shadow-sm transition-all duration-200 hover:border-color-2/40 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-color-2/50 cursor-pointer"
            >
              <span>{t("Login With Google")}</span>
              <ArrowLeftIcon className="size-4 text-color-5 -scale-x-100 rtl:scale-x-100" />
            </button>

            <p className="mt-4 text-center text-xs font-ProximaNovaThin text-color-5">
              {t("Continue with Google to start ordering")}
            </p>
          </div>
        ) : (
          <div className="flex-1 space-y-5">
            {/* Profile card */}
            <div className="flex items-center gap-4 rounded-2xl border border-color-7 bg-card p-4 shadow-sm">
              <ProfileAvatar
                name={user?.userInfo?.name}
                photoUrl={avatarUrl}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wider text-color-5 font-ProximaNovaSemiBold">
                  {t("Your account")}
                </p>
                <h2 className="text-color-1 font-ProximaNovaBold text-xl leading-tight truncate">
                  {user?.userInfo?.name || t("Guest")}
                </h2>
                <p className="text-color-5 font-ProximaNovaThin text-sm truncate" dir="ltr">
                  {user?.userInfo?.phone || t("No phone number added")}
                </p>
              </div>
            </div>

            {isOnboardingComplete === false && (
              <div className="rounded-2xl border border-color-2/30 bg-color-2/10 p-4">
                <p className="text-sm font-ProximaNovaMed text-color-1">
                  {t("ProfileIncomplete")}
                </p>
              </div>
            )}

            {/* Edit profile */}
            <button
              type="button"
              onClick={handleGoToOnboarding}
              className="w-full flex items-center justify-between gap-3 rounded-2xl bg-color-2 px-5 py-4 text-white font-ProximaNovaSemiBold text-base transition-all duration-200 hover:bg-color-2/90 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-color-2/50 cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                {isOnboardingComplete ? (
                  <CheckCircleIcon className="size-5 shrink-0" />
                ) : (
                  <UserRoundIcon className="size-5 shrink-0" />
                )}
                {t("Update User Information")}
              </span>
              <ChevronDownIcon className="size-5 shrink-0 -rotate-90" />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 shrink-0 space-y-4">
          <div className="relative grid grid-cols-2 rounded-2xl bg-color-7/50 p-1.5">
            <div
              className={cn(
                "absolute inset-y-1.5 w-[calc(50%-0.375rem)] rounded-xl bg-white shadow-md transition-[left,right] duration-300",
                pillPosition
              )}
            />
            <button
              className={cn(
                "relative z-10 rounded-xl py-2.5 text-sm transition-colors cursor-pointer",
                lng === "en"
                  ? "text-color-1 font-ProximaNovaSemiBold"
                  : "text-color-5 font-ProximaNovaMed"
              )}
              onClick={() => changeLanguage("en")}
            >
              English
            </button>
            <button
              className={cn(
                "relative z-10 rounded-xl py-2.5 text-sm transition-colors cursor-pointer",
                lng === "ar"
                  ? "text-color-1 font-ProximaNovaSemiBold"
                  : "text-color-5 font-ProximaNovaMed"
              )}
              onClick={() => changeLanguage("ar")}
            >
              العربية
            </button>
          </div>

          {isAuthenticated &&
            (!confirmLogout ? (
              <button
                onClick={() => setConfirmLogout(true)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3.5 text-red-500 font-ProximaNovaSemiBold text-base transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:hover:bg-red-900/50 focus-visible:ring-2 focus-visible:ring-red-300 cursor-pointer"
              >
                <LogOutIcon className="size-4 shrink-0" />
                {t("Logout")}
              </button>
            ) : (
              <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 p-4 space-y-3">
                <p className="text-center text-sm font-ProximaNovaSemiBold text-red-600">
                  {t("Confirm logout?")}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleLogout}
                    className="flex-1 rounded-xl bg-red-500 py-3 text-white font-ProximaNovaSemiBold text-sm transition-colors hover:bg-red-600 cursor-pointer"
                  >
                    {t("Logout")}
                  </button>
                  <button
                    onClick={() => setConfirmLogout(false)}
                    className="flex-1 rounded-xl border border-red-200 bg-card py-3 text-color-6 font-ProximaNovaSemiBold text-sm transition-colors hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/40 cursor-pointer"
                  >
                    {t("Cancel")}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div
        className={cn(
          "login-sidebar-overlay z-30 top-0 left-0 right-0 bottom-0 bg-black/70 transition-opacity overflow-hidden",
          isLoginSidebarOpen ? "fixed" : "hidden"
        )}
        onClick={handleCloseSidebar}
      ></div>
    </>
  );
};

export default LoginSidebar;
