"use client";

import { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

const emptySubscribe = () => () => {};

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showSheet, setShowSheet] = useState(false);

  const checkIfInstalled = useCallback(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    );
  }, []);

  const [isInstalled, setIsInstalled] = useState(() =>
    typeof window !== "undefined" ? checkIfInstalled() : false
  );

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

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

  if (!mounted || isInstalled || !deferredPrompt || isDismissed()) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setShowSheet(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
        size="icon"
        aria-label="Install app"
      >
        <Download className="h-6 w-6" />
      </Button>

      {showSheet && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowSheet(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Install App</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSheet(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-muted-foreground mb-6">
              Install OrderSync Orders for quick access and a better experience.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDismiss}
              >
                Not now
              </Button>
              <Button className="flex-1" onClick={handleInstall}>
                Install
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
