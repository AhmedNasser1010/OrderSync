"use client";

import { useEffect, useSyncExternalStore } from "react";
import { MenuIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { setMenuIsOpen } from "@/rtk/slices/toggleSlice";
import { initWallet } from "@/rtk/slices/walletSlice";
import { useFetchWalletBalanceQuery } from "@/rtk/api/firestoreApi";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Link } from "@/i18n/navigation";
import DeliveryLocation from "@/components/DeliveryLocation";

const emptySubscribe = () => () => {};

const KNOWN_ROUTES = ["cart", "wallet", "checkout", "signin", "onboarding"];

function HomeHeader() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { uid, isAuthenticated } = useAuthSession();

  const segments = pathname.split("/").filter(Boolean);
  const isRestaurantMenu =
    segments.length === 2 && !KNOWN_ROUTES.includes(segments[1]);

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const { data: walletBalance } = useFetchWalletBalanceQuery(uid ?? "", {
    skip: !uid,
  });
  const walletState = useAppSelector((state) => state.wallet);

  useEffect(() => {
    if (isAuthenticated && uid) {
      dispatch(initWallet({ balance: walletBalance ?? 0 }));
    }
  }, [isAuthenticated, uid, walletBalance, dispatch]);

  if (isRestaurantMenu) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-8 pt-3 pb-3 sm:px-10">
        <button
          type="button"
          onClick={() => dispatch(setMenuIsOpen(true))}
          aria-label={t("Menu")}
          className="grid size-9 place-items-center rounded-full text-color-1 hover:bg-color-7/40 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none"
        >
          <MenuIcon className="size-5" />
        </button>
        <DeliveryLocation variant="compact" className="flex" />
        {mounted && isAuthenticated ? (
          <Link
            href="/wallet"
            aria-label={t("Wallet")}
            className="flex size-9 items-center justify-center text-sm font-ProximaNovaSemiBold text-emerald-600"
          >
            {walletState.balance.toFixed(0)} {t("EGP")}
          </Link>
        ) : (
          <div className="size-9" />
        )}
      </div>
    </div>
  );
}

export default HomeHeader;
