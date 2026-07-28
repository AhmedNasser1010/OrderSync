"use client";

import { ReactNode } from "react";
import { LocationPermissionBanner } from "@/components/LocationPermissionBanner";
import { FinanceWarningBanner } from "@/components/FinanceWarningBanner";
import { BottomNav } from "@/components/orders/BottomNav";
import { OrdersHeader } from "@/components/orders/Header";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col">
        <LocationPermissionBanner />
        <FinanceWarningBanner />
        <OrdersHeader />

        <main className="flex-1 pb-28">{children}</main>

        <BottomNav />
      </div>
    </ThemeProvider>
  );
}
