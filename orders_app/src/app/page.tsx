"use client";

import OrdersTabs from "./OrdersTabs";
import OrdersView from "./OrdersView";
import ResStatusBtn from "./ResStatusBtn";
import SettingsMenu from "@/components/more-menu/SettingsMenu";
import useOrders from "@/hooks/useOrders";
import { useAppSelector } from "@/rtk/hooks";
import { activeTab } from "@/rtk/slices/toggleSlice";
import type { MainTabTypes } from "@/types/orders";
import { ClipboardList } from "lucide-react";

const tabLabels: Record<MainTabTypes, string> = {
  RECEIVED: "Received",
  PREPARING: "Preparing",
  DELIVERY: "Delivery",
  COMPLETED: "Completed",
  VOIDED: "Voided",
};

const tabCountsLabel: Record<MainTabTypes, string> = {
  RECEIVED: "new orders waiting",
  PREPARING: "orders in progress",
  DELIVERY: "orders out for delivery",
  COMPLETED: "orders fulfilled",
  VOIDED: "orders cancelled",
};

export default function OrdersPage() {
  const { counts } = useOrders();
  const activeTabValue = useAppSelector(activeTab);

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary shrink-0">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-foreground truncate">
                  Orders
                </h1>
                <p className="text-xs text-muted-foreground truncate">
                  {counts[activeTabValue]} {tabCountsLabel[activeTabValue]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ResStatusBtn />
              <SettingsMenu />
            </div>
          </div>
        </div>
      </header>
      <OrdersTabs counts={counts} />
      <div className="px-4 pb-28 pt-6">
        <OrdersView />
      </div>
    </main>
  );
}
