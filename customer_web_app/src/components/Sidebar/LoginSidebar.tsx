"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  XIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  LogOutIcon,
  ChevronDownIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { toggleLoginSidebar, toggleLng } from "@/rtk/slices/toggleSlice";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "@/i18n/routing";
import { LOGO_URL } from "@/utils/constants";
import UserForm from "@/components/Sidebar/UserForm";
import ProfileAvatar from "@/components/Sidebar/ProfileAvatar";
import { cn } from "@/lib/utils";

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

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
  const { user: authUser, signInWithGoogle, logout } = useAuth();

  const [expandUserInfo, setExpandUserInfo] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const isRTL = locale === "ar";
  const isLoggedIn = !!authUser;

  useEffect(() => {
    if (
      user?.userInfo &&
      expandUserInfo === false &&
      isLoginSidebarOpen === true
    ) {
      if (
        !user.userInfo?.name ||
        !user.userInfo?.phone ||
        !user.locations?.home?.address ||
        !user.locations?.home?.latlng?.[0]
      ) {
        setExpandUserInfo(true);
      }
    }
  }, [user, isLoginSidebarOpen, expandUserInfo]);

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
    setExpandUserInfo(false);
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

  const checks = [
    { label: t("Name"), done: !!user?.userInfo?.name },
    { label: t("Phone Number"), done: !!user?.userInfo?.phone },
    { label: t("Address"), done: !!user?.locations?.home?.address },
    {
      label: t("Location"),
      done:
        !!user?.locations?.home?.latlng?.[0] &&
        !!user?.locations?.home?.latlng?.[1],
    },
  ];
  const completedCount = checks.filter((c) => c.done).length;
  const percent = Math.round((completedCount / checks.length) * 100);
  const isCompletedForm = completedCount === checks.length;

  const avatarUrl =
    authUser?.photoURL ||
    (user?.userInfo as { avatar?: string } | undefined)?.avatar;

  const pillPosition =
    (lng === "ar") === isRTL ? "left-1.5" : "right-1.5";

  return (
    <>
      <div
        className={cn(
          "login-sidebar fixed top-0 h-full overflow-y-scroll bg-white transition-all duration-500 z-40 px-5 py-5 w-full sm:px-8 sm:py-6 flex flex-col sm:w-[500px]",
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
            <img src={LOGO_URL} alt="logo" className="h-9 w-9 object-contain" />
            <span className="font-Beiruti text-2xl text-color-1">
              {t("Zack's Eats")}
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

        {!isLoggedIn ? (
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

            {/* Google sign-in */}
            <button
              onClick={signInWithGoogle}
              className="group w-full flex items-center justify-center gap-3 rounded-2xl border border-color-7 bg-white py-4 px-4 text-base font-ProximaNovaSemiBold text-color-1 shadow-sm transition-all duration-200 hover:border-color-2/40 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-color-2/50 cursor-pointer"
            >
              <GoogleLogo className="size-5 shrink-0" />
              {t("Login With Google")}
            </button>

            <p className="mt-4 text-center text-xs font-ProximaNovaThin text-color-5">
              {t("Continue with Google to start ordering")}
            </p>
          </div>
        ) : (
          <div className="flex-1 space-y-5">
            {/* Profile card */}
            <div className="flex items-center gap-4 rounded-2xl border border-color-7 bg-white p-4 shadow-sm">
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
                <p className="text-color-5 font-ProximaNovaThin text-sm truncate">
                  {user?.userInfo?.phone || t("No phone number added")}
                </p>
              </div>
            </div>

            {/* Completion progress */}
            <div className="rounded-2xl border border-color-7 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider text-color-5 font-ProximaNovaSemiBold">
                  {t("Profile completion")}
                </span>
                <span className="text-color-2 font-ProximaNovaBold text-sm">
                  {percent}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-color-7 mb-4">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-color-2 to-[#ffab4a] transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {checks.map((c) => (
                  <span
                    key={c.label}
                    className="flex items-center gap-2 text-sm font-ProximaNovaMed"
                  >
                    {c.done ? (
                      <CheckCircleIcon className="size-4 shrink-0 text-color-11" />
                    ) : (
                      <XCircleIcon className="size-4 shrink-0 text-red-400" />
                    )}
                    <span
                      className={cn(
                        "truncate",
                        c.done ? "text-color-1" : "text-color-5"
                      )}
                    >
                      {c.label}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Update user info */}
            <div>
              <button
                onClick={() => setExpandUserInfo((expand) => !expand)}
                className={cn(
                  "w-full flex items-center justify-between gap-3 rounded-2xl px-5 py-4 text-white font-ProximaNovaSemiBold text-base transition-all duration-200 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-color-2/50 cursor-pointer",
                  isCompletedForm
                    ? "bg-color-11 hover:bg-color-11/90"
                    : "bg-color-2 hover:bg-color-2/90"
                )}
              >
                <span className="flex items-center gap-2.5">
                  {isCompletedForm ? (
                    <CheckCircleIcon className="size-5 shrink-0" />
                  ) : (
                    <AlertCircleIcon className="size-5 shrink-0" />
                  )}
                  {t("Update User Information")}
                </span>
                <ChevronDownIcon
                  className={cn(
                    "size-5 shrink-0 transition-transform duration-300",
                    expandUserInfo && "rotate-180"
                  )}
                />
              </button>
              {expandUserInfo && (
                <div className="mt-4">
                  <UserForm />
                </div>
              )}
            </div>
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

          {isLoggedIn &&
            (!confirmLogout ? (
              <button
                onClick={() => setConfirmLogout(true)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3.5 text-red-500 font-ProximaNovaSemiBold text-base transition-colors hover:bg-red-100 focus-visible:ring-2 focus-visible:ring-red-300 cursor-pointer"
              >
                <LogOutIcon className="size-4 shrink-0" />
                {t("Logout")}
              </button>
            ) : (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 space-y-3">
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
                    className="flex-1 rounded-xl border border-red-200 bg-white py-3 text-color-6 font-ProximaNovaSemiBold text-sm transition-colors hover:bg-red-50 cursor-pointer"
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
          "login-sidebar-overlay z-30 top-0 left-0 right-0 bottom-0 bg-color-1 opacity-[0.7] overflow-hidden",
          isLoginSidebarOpen ? "fixed" : "hidden"
        )}
        onClick={handleCloseSidebar}
      ></div>
    </>
  );
};

export default LoginSidebar;
