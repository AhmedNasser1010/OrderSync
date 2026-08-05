"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const LOCALES = [
  { code: "en", label: "English" },
  { code: "ar", label: "Arabic" },
] as const;

export function LocaleToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();

  const handleSwitch = (nextLocale: string) => {
    if (nextLocale === locale) return;
    if (user?.uid) {
      updateDoc(doc(db, "drivers", user.uid), { locale: nextLocale }).catch(
        () => {},
      );
    }
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <div className="flex rounded-xl border border-border bg-background/80 p-0.5 shadow-sm">
      {LOCALES.map((l) => {
        const isActive = locale === l.code;
        return (
          <button
            key={l.code}
            onClick={() => handleSwitch(l.code)}
            disabled={isPending}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
