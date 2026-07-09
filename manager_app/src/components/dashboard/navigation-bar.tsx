"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { BarChart3, UtensilsCrossed, Settings } from "lucide-react";

const tabs = [
  { id: "analytics", labelKey: "analytics", icon: BarChart3, href: "/" },
  { id: "menu", labelKey: "menu", icon: UtensilsCrossed, href: "/menu" },
  { id: "settings", labelKey: "settings", icon: Settings, href: "/settings" },
] as const;

export function NavigationBar() {
  const t = useTranslations("Dashboard.bottomNav");
  const pathname = usePathname();
  const router = useRouter();

  const active = useMemo(() => {
    if (pathname?.startsWith("/menu")) return "menu";
    if (pathname?.startsWith("/settings")) return "settings";
    return "analytics";
  }, [pathname]);

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
      <div className="flex items-center justify-around px-2 py-1.5 bg-background/80 dark:bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg shadow-black/5">
        {tabs.map(({ id, labelKey, icon: Icon, href }) => {
          const isActive = active === id;

          return (
            <button
              key={id}
              onClick={() => router.push(href)}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2 min-w-0 transition-colors"
            >
              {isActive && (
                <span className="absolute inset-0 bg-primary/10 rounded-xl -z-0" />
              )}
              <Icon
                className={`w-5 h-5 transition-all duration-200 ${
                  isActive
                    ? "text-primary scale-110"
                    : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {t(labelKey)}
              </span>
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
