"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DownloadIcon,
  SmartphoneIcon,
  WifiOffIcon,
  ZapIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
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

export function PwaInstallButton() {
  const t = useTranslations();
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

  if (isInstalled || !deferredPrompt || isDismissed()) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setShowSheet(true)}
        className="fixed bottom-6 left-6 z-50 size-14 rounded-full bg-color-2 text-white shadow-[0_8px_24px_rgba(252,128,25,0.35)] hover:bg-color-2/90"
        size="icon"
        aria-label={t("Install the app")}
      >
        <DownloadIcon className="size-6" />
      </Button>

      <Popup open={showSheet} onOpenChange={(open) => !open && setShowSheet(false)}>
        <PopupContent className="w-full max-w-sm rounded-2xl p-6 text-center">
          <PopupHeader closePopupCallback={() => setShowSheet(false)}>
            <div className="flex items-center justify-center gap-2 pt-1.5">
              <img
                src={LOGO_URL}
                alt="logo"
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
