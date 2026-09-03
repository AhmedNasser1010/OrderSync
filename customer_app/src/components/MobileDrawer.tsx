"use client";

import {
  useEffect,
  useState,
} from "react";
import Image from "next/image";
import {
  XIcon,
  BikeIcon,
  GlobeIcon,
  ShoppingCartIcon,
  SunIcon,
  MoonIcon,
  LogOutIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  UserRoundIcon,
  ChevronDownIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import {
  setMenuIsOpen,
  toggleOrderSidebar,
  toggleLng,
  setTheme,
} from "@/rtk/slices/toggleSlice";
import { LOGO_URL } from "@/utils/constants";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useAuthSession } from "@/hooks/useAuthSession";
import ProfileAvatar from "@/components/Sidebar/ProfileAvatar";
import { cn } from "@/lib/utils";
import { IS_COMING_SOON } from "@/utils/comingSoon";

function LanguageToggleItem() {
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <button
      type="button"
      onClick={() => {
        const next = locale === "ar" ? "en" : "ar";
        dispatch(toggleLng(next));
        router.replace(pathname, { locale: next });
      }}
      className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-color-7 py-3 font-ProximaNovaSemiBold text-color-1 transition-colors hover:bg-color-7/40 focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none"
    >
      <GlobeIcon className="size-4 text-color-5" />
      <span>{locale === "ar" ? "English" : "العربية"}</span>
    </button>
  );
}

function ThemeToggleItem() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.toggle.theme);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => dispatch(setTheme(isDark ? "light" : "dark"))}
      className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-color-7 px-4 py-3 font-ProximaNovaSemiBold text-color-1 transition-colors hover:bg-color-7/40 focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none"
    >
      {isDark ? (
        <SunIcon className="size-4 text-color-2" />
      ) : (
        <MoonIcon className="size-4 text-color-5" />
      )}
    </button>
  );
}

function MobileDrawer() {
  const t = useTranslations();
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.toggle.isMenuOpen);
  const cartItems = useAppSelector((state) => state.cart.items);
  const user = useAppSelector((state) => state.user);
  const { logout, isAuthenticated, isOnboardingComplete } = useAuthSession();
  const router = useRouter();
  const isRTL = locale === "ar";

  const [confirmLogout, setConfirmLogout] = useState(false);

  const close = () => {
    dispatch(setMenuIsOpen(false));
    document.body.classList.remove("overflow-hidden");
    setConfirmLogout(false);
  };

  useEffect(() => {
    if (!confirmLogout) return;
    const timer = setTimeout(() => setConfirmLogout(false), 5000);
    return () => clearTimeout(timer);
  }, [confirmLogout]);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", open);
    return () => document.body.classList.remove("overflow-hidden");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dispatch]);

  const handleOrderSidebar = () => {
    close();
    dispatch(toggleOrderSidebar());
    document.body.classList.add("overflow-hidden");
  };

  const handleLogout = async () => {
    close();
    await logout();
  };

  const handleGoToSignin = () => {
    close();
    router.push("/signin");
  };

  const handleGoToOnboarding = () => {
    close();
    router.push("/onboarding");
  };

  const avatarUrl = (user?.userInfo as { avatar?: string } | undefined)?.avatar;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[55] bg-black/60 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={close}
      />
      <div
        className={cn(
          "fixed top-0 bottom-0 z-[56] flex w-[82%] max-w-sm flex-col bg-card shadow-2xl transition-transform duration-300",
          isRTL ? "right-0" : "left-0",
          open ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label={t("Menu")}
      >
        <div className="flex items-center justify-between border-b border-color-7 px-5 py-4">
          <div className="flex items-center gap-2">
            <Image
              src={LOGO_URL}
              alt="logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <span className="font-Beiruti text-2xl text-color-1">
              {t("Zajil")}
            </span>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={t("Close")}
            className="grid size-9 place-items-center rounded-full bg-color-7/60 hover:bg-color-7 transition-colors cursor-pointer"
          >
            <XIcon className="size-5 text-color-1" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {!IS_COMING_SOON && user?.trackedOrder?.id && (
            <button
              type="button"
              onClick={handleOrderSidebar}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-color-11/10 py-3.5 font-ProximaNovaSemiBold text-color-11 transition-colors hover:bg-color-11/20 cursor-pointer"
            >
              <BikeIcon className="size-4" />
              {t("Order Track")}
            </button>
          )}

          {!isAuthenticated ? (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-color-2 via-[#ff8c3b] to-[#ffab4a] p-6 text-white shadow-lg shadow-color-2/25">
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

              <button
                type="button"
                onClick={handleGoToSignin}
                className="group w-full flex items-center justify-center gap-3 rounded-2xl border border-color-7 bg-card py-4 text-base font-ProximaNovaSemiBold text-color-1 shadow-sm transition-all duration-200 hover:border-color-2/40 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-color-2/50 cursor-pointer"
              >
                <span>{t("Login With Google")}</span>
                <ArrowLeftIcon className="size-4 text-color-5 -scale-x-100 rtl:scale-x-100" />
              </button>

              <p className="mt-1 text-center text-xs font-ProximaNovaThin text-color-5">
                {t("Continue with Google to start ordering")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
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

              <button
                type="button"
                onClick={handleGoToOnboarding}
                className={cn(
                  "w-full flex items-center justify-between gap-3 rounded-2xl px-5 py-4 font-ProximaNovaSemiBold text-base transition-all duration-200 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-color-2/50 cursor-pointer",
                  isOnboardingComplete
                    ? "bg-color-2 text-white hover:bg-color-2/90"
                    : "border border-amber-400/50 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
                )}
              >
                <span className="flex items-center gap-2.5">
                  {isOnboardingComplete ? (
                    <CheckCircleIcon className="size-5 shrink-0" />
                  ) : (
                    <UserRoundIcon className="size-5 shrink-0" />
                  )}
                  {t("Update User Information")}
                </span>
                <ChevronDownIcon className="size-5 shrink-0 -rotate-90 rtl:rotate-90" />
              </button>
            </div>
          )}

          <div className="space-y-3">
            {!IS_COMING_SOON && cartItems.length > 0 && (
              <Link
                href="/cart"
                onClick={close}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-color-7 py-2 font-ProximaNovaSemiBold text-color-1 transition-colors hover:bg-color-7/40"
              >
                <ShoppingCartIcon className="size-4" />
                {t("Cart")}
              </Link>
            )}
            <div className="flex gap-2">
              <LanguageToggleItem />
              <ThemeToggleItem />
            </div>
          </div>
        </div>

        <div className="border-t border-color-7 px-5 py-4">
          {isAuthenticated &&
            (!confirmLogout ? (
              <button
                type="button"
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
    </>
  );
}

export default MobileDrawer;
