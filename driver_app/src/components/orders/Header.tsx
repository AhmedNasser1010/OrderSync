"use client";

import { usePathname } from "next/navigation";
import useUser from "@/hooks/useUser";
import { useGeoPermission } from "@/components/LocationProvider";
import { OnlineToggle } from "@/components/OnlineToggle";
import { UserMenu } from "@/components/UserMenu";
import type { ReactNode } from "react";
import { Package, Store, Settings } from "lucide-react";

interface OrdersHeaderProps {
  icon?: ReactNode;
}

export function OrdersHeader({ icon }: OrdersHeaderProps) {
  const pathname = usePathname();
  const permissionState = useGeoPermission();
  const { userData } = useUser();

  const online = userData?.online ?? { byManager: false, byUser: false };

  const title = pathname.startsWith("/orders/marketplace")
    ? "Marketplace"
    : pathname.startsWith("/orders/settings")
      ? "Settings"
      : "My Orders";

  const pageIcon = icon ?? (
    <>
      {pathname.startsWith("/orders/marketplace") ? (
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
          <OnlineToggle
            byManager={online.byManager}
            byUser={online.byUser}
            permissionState={permissionState}
          />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
