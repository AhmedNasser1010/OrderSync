"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { BellRing, X } from "lucide-react";
import useForegroundMessage from "@/hooks/useForegroundMessage";

type ToastPayload = { title?: string; body?: string };

const AUTO_DISMISS_MS = 7000;

export function NewOrderToast() {
  const router = useRouter();
  const t = useTranslations("notifications");
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useForegroundMessage((payload) => {
    setToast(payload);
  });

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (toast) {
      timerRef.current = setTimeout(() => setToast(null), AUTO_DISMISS_MS);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="fixed inset-x-3 top-3 z-[1000] animate-in slide-in-from-top-3 fade-in duration-300">
      <div className="flex items-center gap-3 rounded-2xl border bg-background/95 p-3 shadow-lg shadow-black/5 backdrop-blur">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-muted">
          <Image
            src="/icon.png"
            alt=""
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
            <BellRing className="h-3.5 w-3.5 shrink-0 text-primary" />
            {toast.title ?? t("newOrderTitle")}
          </p>
          {toast.body && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {toast.body}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => router.push("/orders/marketplace")}
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t("view")}
        </button>
        <button
          type="button"
          onClick={() => setToast(null)}
          aria-label={t("close")}
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
