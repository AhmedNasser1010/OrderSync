"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LocationPermissionBanner } from "@/components/LocationPermissionBanner";
import { FinanceWarningBanner } from "@/components/FinanceWarningBanner";
import { BottomNav } from "@/components/orders/BottomNav";
import { OrdersHeader } from "@/components/orders/Header";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function OrdersLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMapPage = pathname === "/orders/map";

  return (
    <ThemeProvider>
      <div className="flex min-h-dvh flex-col">
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
    </ThemeProvider>
  );
}
