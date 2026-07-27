"use client";

import MainHeader from "../MainHeader";
import OrdersTabs from "../OrdersTabs";
import useOrders from "@/hooks/useOrders";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { counts } = useOrders();

  return (
    <main className="min-h-screen bg-background">
      <MainHeader />
      {children}
      <OrdersTabs counts={counts} />
    </main>
  );
}
