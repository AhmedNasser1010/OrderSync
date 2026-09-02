"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  MenuIcon,
  XIcon,
  MapPinIcon,
  BikeIcon,
  ChevronDownIcon,
  LogOutIcon,
  ShoppingCartIcon,
  WalletIcon,
  GlobeIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import {
  toggleLoginSidebar,
  setLoginSidebarIsOpen,
  toggleOrderSidebar,
  toggleLng,
  setTheme,
} from "@/rtk/slices/toggleSlice";
import { LOGO_URL } from "@/utils/constants";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { initServices } from "@/rtk/slices/servicesSlice";
import { initWallet } from "@/rtk/slices/walletSlice";
import {
  useFetchServicesQuery,
  useFetchWalletBalanceQuery,
} from "@/rtk/api/firestoreApi";
import { useAuthSession } from "@/hooks/useAuthSession";
import { toast } from "sonner";
import DeliveryLocation from "@/components/DeliveryLocation";
import ProfileAvatar from "@/components/Sidebar/ProfileAvatar";
import { cn } from "@/lib/utils";
import { IS_COMING_SOON } from "@/utils/comingSoon";

const emptySubscribe = () => () => {};

function LanguageSwitcher({
  onNavigate,
  className,
  fullWidth,
}: {
  onNavigate?: () => void;
  className?: string;
  fullWidth?: boolean;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const node = e.target as Node;
      const inside =
        (ref.current && ref.current.contains(node)) ||
        (menuRef.current && menuRef.current.contains(node));
      if (!inside) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const toggleMenu = () => {
    const next = !open;
    if (next && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const isRtl = locale === "ar";
      const gap = 8;
      const menuHeight = 96;
      const openUpward = rect.bottom + gap + menuHeight > window.innerHeight;
      setMenuStyle({
        position: "fixed",
        insetInlineStart: isRtl ? window.innerWidth - rect.right : rect.left,
        zIndex: 60,
        ...(openUpward
          ? { bottom: window.innerHeight - rect.top + gap }
          : { top: rect.bottom + gap }),
      });
    }
    setOpen(next);
  };

  const changeLanguage = (lng: string) => {
    dispatch(toggleLng(lng));
    router.replace(pathname, { locale: lng });
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("Language")}
        className={cn(
          "flex items-center gap-1.5 rounded-full border border-color-7 px-3 py-2 text-sm font-ProximaNovaSemiBold text-color-1 transition-colors hover:bg-color-7/40 focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none cursor-pointer",
          fullWidth && "w-full justify-center"
        )}
      >
        <GlobeIcon className="size-4 text-color-5" />
        <span className="uppercase">{locale}</span>
        <ChevronDownIcon className="size-3.5 text-color-5" />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={menuStyle}
            className="w-32 overflow-hidden rounded-2xl border border-color-7 bg-card py-1.5 shadow-xl"
          >
            {(["en", "ar"] as const).map((lng) => (
              <button
                key={lng}
                type="button"
                role="menuitem"
                onClick={() => changeLanguage(lng)}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-color-7/40",
                  locale === lng
                    ? "font-ProximaNovaSemiBold text-color-2"
                    : "font-ProximaNovaMed text-color-6"
                )}
              >
                {lng === "en" ? "English" : "العربية"}
                {locale === lng && <span className="size-1.5 rounded-full bg-color-2" />}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

function ThemeToggle({
  onNavigate,
  fullWidth,
}: {
  onNavigate?: () => void;
  fullWidth?: boolean;
}) {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.toggle.theme);

  const toggleTheme = () => {
    dispatch(setTheme(theme === "dark" ? "light" : "dark"));
    onNavigate?.();
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t(isDark ? "Light mode" : "Dark mode")}
      title={t(isDark ? "Light mode" : "Dark mode")}
      className={cn(
        "flex items-center gap-1.5 rounded-full border border-color-7 px-3 py-2 text-sm font-ProximaNovaSemiBold text-color-1 transition-colors hover:bg-color-7/40 focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none cursor-pointer",
        fullWidth && "w-full justify-center"
      )}
    >
      {isDark ? (
        <SunIcon className="size-4 text-color-2" />
      ) : (
        <MoonIcon className="size-4 text-color-5" />
      )}
      <span>{t(isDark ? "Light mode" : "Dark mode")}</span>
    </button>
  );
}

function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const user = useAppSelector((state) => state.user);
  const { logout, isAuthenticated, uid } = useAuthSession();
  const router = useRouter();
  const pathname = usePathname();
  const isRTL = locale === "ar";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isHome = pathname === `/${locale}` || pathname === "/";
  const isLoggedIn = isAuthenticated;

  const { data: servicesConfig } = useFetchServicesQuery();

  const { data: walletBalance } = useFetchWalletBalanceQuery(uid ?? "", {
    skip: !uid,
  });
  const walletState = useAppSelector((state) => state.wallet);

  useEffect(() => {
    if (isLoggedIn && uid) {
      dispatch(initWallet({ balance: walletBalance ?? 0 }));
    }
  }, [isLoggedIn, uid, walletBalance, dispatch]);

  useEffect(() => {
    if (servicesConfig) {
      dispatch(
        initServices({
          deliveryFees: servicesConfig.deliveryFees,
          minDeliveryFees: servicesConfig.minDeliveryFees,
          maxWorkDistanceKm: servicesConfig.maxWorkDistanceKm,
          cashback: servicesConfig.cashback,
          maintenance: servicesConfig.maintenance,
        })
      );
    }
  }, [servicesConfig, dispatch]);

  useEffect(() => {
    if (isLoggedIn && user?.userInfo?.uid && !user?.userInfo?.phone) {
      toast(t("updateContactInfoAfterLogin"), {
        position: "top-center",
        duration: 4000,
      });
      document.body.classList.add("overflow-hidden");
      dispatch(setLoginSidebarIsOpen(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user?.userInfo?.uid, user?.userInfo?.phone]);

  useEffect(() => {
    dispatch(toggleLng(locale));
  }, [locale, dispatch]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [profileOpen]);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", menuOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const handleOrderSidebar = () => {
    dispatch(toggleOrderSidebar());
    document.body.classList.add("overflow-hidden");
  };

  const handleLoginSidebar = () => {
    dispatch(toggleLoginSidebar());
    document.body.classList.add("overflow-hidden");
  };

  const handleOrderNow = () => {
    setMenuOpen(false);
    if (isHome) {
      document.getElementById("restaurants")?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/");
    }
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    setMenuOpen(false);
    await logout();
  };

  const avatarUrl =
    (user?.userInfo as { avatar?: string } | undefined)?.avatar;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-color-2 focus:px-4 focus:py-2 focus:text-white focus:font-ProximaNovaSemiBold"
      >
        {t("Skip to content")}
      </a>
      <header
        className={cn(
          "shadow-md w-full fixed left-0 top-0 right-0 z-40 bg-background transition-all duration-300",
          scrolled ? "h-14 md:px-5 px-3" : "h-20 md:px-5 px-3"
        )}
      >
        <div className="flex justify-between items-center h-full container mx-auto">
          <div className="flex items-center md:gap-5 gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t("Menu")}
              className="lg:hidden grid size-9 place-items-center rounded-full text-color-1 hover:bg-color-7/40 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none"
            >
              <MenuIcon className="size-5" />
            </button>
            <Link href="/" aria-label={t("Home")}>
              <h1
                className={cn(
                  "font-Beiruti transition-all",
                  scrolled ? "md:text-2xl text-xl" : "md:text-3xl text-2xl"
                )}
              >
                {t("Zajil")}
              </h1>
            </Link>
          </div>

          <div className="hidden lg:block">
            <DeliveryLocation variant="compact" />
          </div>

          <ul className="flex items-center gap-1 sm:gap-2.5">
            {!IS_COMING_SOON && isHome && (
              <li className="hidden lg:block">
                <button
                  type="button"
                  onClick={handleOrderNow}
                  className="hidden md:flex items-center gap-1.5 rounded-full bg-color-2 px-5 py-2 text-sm font-ProximaNovaSemiBold text-white transition-all hover:bg-color-2/90 focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none cursor-pointer"
                >
                  {t("Order now")}
                </button>
              </li>
            )}

            {!IS_COMING_SOON && user?.trackedOrder?.id && (
              <li>
                <button
                  type="button"
                  onClick={handleOrderSidebar}
                  aria-label={t("Order Tracking")}
                  className="order-pulse flex items-center gap-1.5 rounded-full bg-color-11/10 px-3 py-2 text-sm font-ProximaNovaSemiBold text-color-11 transition-colors hover:bg-color-11/20 focus-visible:ring-2 focus-visible:ring-color-11/50 outline-none cursor-pointer"
                >
                  <BikeIcon className="size-4" />
                  <span className="hidden sm:inline">{t("Order Track")}</span>
                </button>
              </li>
            )}

            <li className="hidden md:block">
              <LanguageSwitcher />
            </li>

            <li className="hidden md:block">
              <ThemeToggle />
            </li>

            {isLoggedIn ? (
              <li>
                <div ref={profileRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={profileOpen}
                    aria-label={t("Your account")}
                    className="flex items-center gap-2 rounded-full border border-color-7 py-1.5 ps-1.5 pe-2 transition-colors hover:bg-color-7/40 focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none cursor-pointer"
                  >
                    <ProfileAvatar
                      name={user?.userInfo?.name}
                      photoUrl={avatarUrl}
                      size="sm"
                    />
                    <ChevronDownIcon className="size-3.5 text-color-5" />
                  </button>
                  {profileOpen && (
                    <div
                      role="menu"
                      className="absolute end-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-color-7 bg-card py-2 shadow-xl"
                    >
                      <div className="border-b border-color-7 px-4 py-3">
                        <p className="truncate text-sm font-ProximaNovaSemiBold text-color-1">
                          {user?.userInfo?.name || t("Guest")}
                        </p>
                        <p className="truncate text-xs font-ProximaNovaThin text-color-5" dir="ltr">
                          {user?.userInfo?.phone || t("No phone number added")}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setProfileOpen(false);
                          handleLoginSidebar();
                        }}
                        className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm font-ProximaNovaMed text-color-6 transition-colors hover:bg-color-7/40"
                      >
                        <UserIcon className="size-4 text-color-5" />
                        {t("Your account")}
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm font-ProximaNovaMed text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/40"
                      >
                        <LogOutIcon className="size-4" />
                        {t("Logout")}
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ) : (
              <li>
                <button
                  type="button"
                  onClick={() => router.push("/signin")}
                  className="flex items-center gap-1.5 rounded-full border border-color-7 px-4 py-2 text-sm font-ProximaNovaSemiBold text-color-1 transition-colors hover:bg-color-7/40 focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none cursor-pointer"
                >
                  <UserIcon className="size-4 text-color-5" />
                  <span className="hidden md:inline">{t("Sign In")}</span>
                </button>
              </li>
            )}

            {!IS_COMING_SOON && mounted && cartItems.length > 0 && (
              <li>
                <Link
                  href="/cart"
                  aria-label={t("Cart")}
                  className="flex items-center gap-1.5 rounded-full px-2 py-2 text-sm font-ProximaNovaSemiBold text-color-1 transition-colors hover:bg-color-7/40 focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none"
                >
                  <span className="relative">
                    <ShoppingCartIcon className="size-5" />
                    <span className="absolute -top-2 -end-2 grid min-w-4.5 min-h-4.5 place-items-center rounded-full bg-color-2 px-1 text-[10px] font-ProximaNovaBold text-white">
                      {cartItems.length}
                    </span>
                  </span>
                  <span className="hidden sm:inline">{t("Cart")}</span>
                </Link>
              </li>
            )}

            {!IS_COMING_SOON && mounted && isLoggedIn && (
              <li>
                <Link
                  href="/wallet"
                  aria-label={t("Wallet")}
                  className="flex items-center gap-1.5 rounded-full border border-color-7 px-3 py-2 text-sm font-ProximaNovaSemiBold text-color-1 transition-colors hover:bg-color-7/40 focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none"
                >
                  <WalletIcon className="size-4 text-color-5" />
                  <span className="text-emerald-600">
                    {walletState.balance.toFixed(2)} {t("EGP")}
                  </span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[55] bg-black/60 transition-opacity duration-300 lg:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMenuOpen(false)}
      />
      <div
        className={cn(
          "fixed top-0 bottom-0 z-[56] flex w-[82%] max-w-sm flex-col bg-card shadow-2xl transition-transform duration-300 lg:hidden",
          isRTL ? "right-0" : "left-0",
          menuOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label={t("Menu")}
      >
        <div className="flex items-center justify-between border-b border-color-7 px-5 py-4">
          <div className="flex items-center gap-2">
            <Image src={LOGO_URL} alt="logo" width={36} height={36} className="h-9 w-9 object-contain" />
            <span className="font-Beiruti text-2xl text-color-1">
              {t("Zajil")}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label={t("Close")}
            className="grid size-9 place-items-center rounded-full bg-color-7/60 hover:bg-color-7 transition-colors cursor-pointer"
          >
            <XIcon className="size-5 text-color-1" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {!IS_COMING_SOON && (
            <button
              type="button"
              onClick={handleOrderNow}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-color-2 py-3.5 font-ProximaNovaSemiBold text-white transition-colors hover:bg-color-2/90 cursor-pointer"
            >
              <MapPinIcon className="size-4" />
              {t("Order now")}
            </button>
          )}

          {!IS_COMING_SOON && user?.trackedOrder?.id && (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                handleOrderSidebar();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-color-11/10 py-3.5 font-ProximaNovaSemiBold text-color-11 transition-colors hover:bg-color-11/20 cursor-pointer"
            >
              <BikeIcon className="size-4" />
              {t("Order Track")}
            </button>
          )}

          <div className="border-t border-color-7 pt-4 space-y-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3 rounded-2xl border border-color-7 p-3">
                <ProfileAvatar
                  name={user?.userInfo?.name}
                  photoUrl={avatarUrl}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-ProximaNovaSemiBold text-color-1">
                    {user?.userInfo?.name || t("Guest")}
                  </p>
                  <p className="truncate text-xs font-ProximaNovaThin text-color-5" dir="ltr">
                    {user?.userInfo?.phone || t("No phone number added")}
                  </p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/signin");
                }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-color-7 py-3 font-ProximaNovaSemiBold text-color-1 transition-colors hover:bg-color-7/40 cursor-pointer"
              >
                <UserIcon className="size-4 text-color-5" />
                {t("Sign In")}
              </button>
            )}
          </div>

          <div className="space-y-3">
            {!IS_COMING_SOON && mounted && cartItems.length > 0 && (
              <Link
                href="/cart"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-color-7 py-2 font-ProximaNovaSemiBold text-color-1 transition-colors hover:bg-color-7/40"
              >
                <ShoppingCartIcon className="size-4" />
                {t("Cart")}
              </Link>
            )}
            <div className="flex items-center gap-3">
              <ThemeToggle onNavigate={() => setMenuOpen(false)} fullWidth />
              <LanguageSwitcher onNavigate={() => setMenuOpen(false)} fullWidth />
            </div>
          </div>

          {isLoggedIn && (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3 font-ProximaNovaSemiBold text-red-500 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:hover:bg-red-900/50 cursor-pointer"
            >
              <LogOutIcon className="size-4" />
              {t("Logout")}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default Header;
