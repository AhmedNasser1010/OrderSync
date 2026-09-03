"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  DownloadIcon,
  SmartphoneIcon,
  WifiOffIcon,
  ZapIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Popup,
  PopupContent,
  PopupHeader,
  PopupFooter,
  PopupTitle,
  PopupDescription,
} from "@/components/ui/custom/Popup";
import { LOGO_URL } from "@/utils/constants";
import type { RootState } from "@/rtk/store";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

const features = [
  {
    icon: ZapIcon,
    titleKey: "Install app feature 1 title",
    descKey: "Install app feature 1 desc",
    color: "bg-color-2/10 text-color-2",
  },
  {
    icon: SmartphoneIcon,
    titleKey: "Install app feature 2 title",
    descKey: "Install app feature 2 desc",
    color: "bg-color-11/10 text-color-11",
  },
  {
    icon: WifiOffIcon,
    titleKey: "Install app feature 3 title",
    descKey: "Install app feature 3 desc",
    color: "bg-blue-100 text-blue-600",
  },
];

const KNOWN_ROUTES = ["cart", "wallet", "checkout", "signin", "onboarding"];
const HIDDEN_ROUTES = ["signin", "onboarding"];

export function PwaInstallButton() {
  const t = useTranslations();
  const pathname = usePathname();
  const isOrderSidebarOpen = useSelector(
    (state: RootState) => state.toggle.isOrderSidebarOpen
  );

  const segments = pathname.split("/").filter(Boolean);
  const currentPage = segments[1] ?? "";
  const isRestaurantMenu =
    segments.length === 2 && !KNOWN_ROUTES.includes(currentPage);

  const isHidden =
    isRestaurantMenu || isOrderSidebarOpen || HIDDEN_ROUTES.includes(currentPage);

  const checkIfInstalled = useCallback(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as { standalone?: boolean }).standalone === true)
    );
  }, []);

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => checkIfInstalled());

  const isDismissed = useCallback(() => {
    if (typeof window === "undefined") return false;
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (!dismissed) return false;
    const dismissedTime = parseInt(dismissed, 10);
    return Date.now() - dismissedTime < DISMISS_DURATION;
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setShowSheet(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShowSheet(false);
    setDeferredPrompt(null);
  };

  if (isHidden || isInstalled || !deferredPrompt || isDismissed()) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowSheet(true)}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-color-2 px-4 py-2 text-sm font-ProximaNovaSemiBold text-white shadow-[0_8px_24px_rgba(252,128,25,0.35)] transition-all hover:bg-color-2/90 hover:shadow-[0_8px_32px_rgba(252,128,25,0.45)] active:scale-95 lg:hidden"
        aria-label={t("Install the app")}
      >
        <DownloadIcon className="size-4" />
        {t("Install the app")}
      </button>

      <Popup open={showSheet} onOpenChange={(open) => !open && setShowSheet(false)}>
        <PopupContent className="w-full max-w-sm rounded-2xl p-6 text-center">
          <PopupHeader closePopupCallback={() => setShowSheet(false)}>
            <div className="flex items-center justify-center gap-2 pt-1.5">
              <Image
                src={LOGO_URL}
                alt="logo"
                width={32}
                height={32}
                className="size-8 rounded-xl object-contain"
              />
              <span className="font-Beiruti text-2xl text-color-1">
                {t("Zajil")}
              </span>
            </div>

            <div className="mx-auto mt-4 grid size-20 place-items-center rounded-3xl bg-color-2/10">
              <DownloadIcon className="size-9 text-color-2" />
            </div>

            <PopupTitle className="mt-3">{t("Install Zajil App")}</PopupTitle>
            <PopupDescription className="font-ProximaNovaThin">
              {t("Install app description")}
            </PopupDescription>
          </PopupHeader>

          <div className="flex flex-col gap-3">
            {features.map((feature) => (
              <div
                key={feature.titleKey}
                className="flex items-center gap-3 rounded-2xl border border-color-7 bg-card p-3 text-start shadow-sm"
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl ${feature.color}`}
                >
                  <feature.icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-ProximaNovaSemiBold text-sm text-color-1">
                    {t(feature.titleKey)}
                  </p>
                  <p className="font-ProximaNovaThin text-xs text-color-6">
                    {t(feature.descKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <PopupFooter>
            <Button
              variant="ghost"
              className="h-11 w-full rounded-xl font-ProximaNovaSemiBold text-color-6 hover:bg-color-7/40 hover:text-color-1"
              onClick={handleDismiss}
            >
              {t("Not now")}
            </Button>
            <Button
              className="h-11 w-full gap-2 rounded-xl bg-color-2 font-ProximaNovaSemiBold text-white hover:bg-color-2/90"
              onClick={handleInstall}
            >
              <DownloadIcon className="size-4" />
              {t("Install now")}
            </Button>
          </PopupFooter>
        </PopupContent>
      </Popup>
    </>
  );
}
