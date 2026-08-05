"use client";

import { ReactNode } from "react";
import { usePathname } from "@/i18n/routing";
import { LocationPermissionBanner } from "@/components/LocationPermissionBanner";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import { NewOrderToast } from "@/components/NewOrderToast";
import { FinanceWarningBanner } from "@/components/FinanceWarningBanner";
import { BottomNav } from "@/components/orders/BottomNav";
import { OrdersHeader } from "@/components/orders/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SettingsSync } from "@/components/SettingsSync";
import { BusinessNamesProvider } from "@/contexts/BusinessNamesContext";

export default function OrdersLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMapPage = pathname === "/orders/map";

  return (
    <ThemeProvider>
      <SettingsSync />
      <BusinessNamesProvider>
      <div className="flex min-h-dvh flex-col">
        <NotificationPermissionBanner />
        <NewOrderToast />
        {!isMapPage && (
          <>
            <LocationPermissionBanner />
            <FinanceWarningBanner />
            <OrdersHeader />
          </>
        )}

        <main className={isMapPage ? "flex-1" : "flex-1 pb-28"}>
          {children}
        </main>

        <BottomNav />
      </div>
      </BusinessNamesProvider>
    </ThemeProvider>
  );
}
