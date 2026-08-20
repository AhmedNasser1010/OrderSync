"use client";

import { usePathname } from "@/i18n/routing";
import useUser from "@/hooks/useUser";
import { useGeoPermission } from "@/components/LocationProvider";
import { OnlineToggle } from "@/components/OnlineToggle";
import { UserMenu } from "@/components/UserMenu";
import useDriverFinance from "@/hooks/useDriverFinance";
import type { ReactNode } from "react";
import { Package, Store, Settings, Wallet, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

interface OrdersHeaderProps {
  icon?: ReactNode;
}

export function OrdersHeader({ icon }: OrdersHeaderProps) {
  const t = useTranslations("header");
  const pathname = usePathname();
  const permissionState = useGeoPermission();
  const { userData } = useUser();

  const online = userData?.online ?? { byManager: false, byUser: false };
  const { currentCash, isLoading: financeLoading } = useDriverFinance();

  const title = pathname.startsWith("/orders/map")
    ? t("map")
    : pathname.startsWith("/orders/marketplace")
      ? t("marketplace")
      : pathname.startsWith("/orders/settings")
        ? t("settings")
        : t("myOrders");

  const pageIcon = icon ?? (
    <>
      {pathname.startsWith("/orders/map") ? (
        <MapPin className="h-5 w-5" />
      ) : pathname.startsWith("/orders/marketplace") ? (
        <Store className="h-5 w-5" />
      ) : pathname.startsWith("/orders/settings") ? (
        <Settings className="h-5 w-5" />
      ) : (
        <Package className="h-5 w-5" />
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {pageIcon}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-foreground">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex flex-col items-end gap-0.5">
            {!financeLoading && (
              <div className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                <Wallet className="h-3 w-3" />
                <span className="tabular-nums">${currentCash.toFixed(2)}</span>
              </div>
            )}
            <OnlineToggle
              byManager={online.byManager}
              byUser={online.byUser}
              permissionState={permissionState}
            />
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}