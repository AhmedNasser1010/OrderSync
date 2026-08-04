"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/routing";
import ResStatusBtn from "./ResStatusBtn";
import WorkingHoursBadge from "./WorkingHoursBadge";
import useOrders from "@/hooks/useOrders";
import { useAppSelector } from "@/rtk/hooks";
import { activeTab } from "@/rtk/slices/toggleSlice";
import type { MainTabTypes } from "@/types/orders";
import {
  SquareArrowDown,
  CookingPot,
  Bike,
  CheckCircle,
  XCircle,
  Settings,
} from "lucide-react";

const tabIcons: Record<MainTabTypes, React.ElementType> = {
  RECEIVED: SquareArrowDown,
  PREPARING: CookingPot,
  DELIVERY: Bike,
  COMPLETED: CheckCircle,
  VOIDED: XCircle,
};

const tabCountsLabel: Record<MainTabTypes, string> = {
  RECEIVED: "newOrders",
  PREPARING: "preparingOrders",
  DELIVERY: "deliveryOrders",
  COMPLETED: "completedOrders",
  VOIDED: "voidedOrders",
};

export default function MainHeader() {
  const t = useTranslations("Orders.header");
  const st = useTranslations("Settings.header");
  const pathname = usePathname();
  const isSettings = pathname === "/settings";

  if (isSettings) {
    return (
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary shrink-0">
                <Settings className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-foreground truncate">
                  {st("title")}
                </h1>
                <p className="text-xs text-muted-foreground truncate">
                  {st("subtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <WorkingHoursBadge />
              <ResStatusBtn />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return <HomeHeader />;
}

function HomeHeader() {
  const t = useTranslations("Orders.header");
  const { counts } = useOrders();
  const activeTabValue = useAppSelector(activeTab);
  const ActiveIcon = tabIcons[activeTabValue];

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary shrink-0">
              <ActiveIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-foreground truncate">
                {t("title")}
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                {counts[activeTabValue]} {t(tabCountsLabel[activeTabValue])}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <WorkingHoursBadge />
            <ResStatusBtn />
          </div>
        </div>
      </div>
    </header>
  );
}
