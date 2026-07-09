"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { BarChart3, UtensilsCrossed, Settings } from "lucide-react";

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function BottomNav({
  activeTab = "analytics",
  onTabChange,
}: BottomNavProps) {
  const t = useTranslations("Dashboard.bottomNav");
  const pathname = usePathname();
  const router = useRouter();

  const tabs = useMemo(
    () => [
      { id: "analytics", label: t("analytics"), icon: BarChart3, href: "/" },
      { id: "menu", label: t("menu"), icon: UtensilsCrossed, href: "/menu" },
      {
        id: "settings",
        label: t("restaurantSettings"),
        icon: Settings,
        href: "/settings",
      },
    ],
    [t],
  );

  const active = useMemo(() => {
    if (pathname?.startsWith("/menu")) return "menu";
    if (pathname?.startsWith("/settings"))
      return "settings";
    return pathname === "/" ? "analytics" : activeTab;
  }, [pathname, activeTab]);

  const handleTabChange = (tabId: string, href: string) => {
    onTabChange?.(tabId);
    router.push(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2">
      <div className="flex items-center justify-between max-w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id, tab.href)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition ${
                isActive
                  ? "text-primary bg-muted"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
