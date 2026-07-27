"use client";

import MainHeader from "@/app/MainHeader";
import OrdersTabs from "@/app/OrdersTabs";
import useOrders from "@/hooks/useOrders";
import { useMemo } from "react";
import { getPreparingAgeUrgency } from "@/lib/orderAge";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { counts, preparingOrders } = useOrders();

  const hasPreparingUrgency = useMemo(
    () => preparingOrders.some((o) => o.timeline.preparingAt && getPreparingAgeUrgency(o.timeline.preparingAt) !== "normal"),
    [preparingOrders],
  );

  return (
    <main className="min-h-screen bg-background">
      <MainHeader />
      {children}
      <OrdersTabs counts={counts} hasPreparingUrgency={hasPreparingUrgency} />
    </main>
  );
}
