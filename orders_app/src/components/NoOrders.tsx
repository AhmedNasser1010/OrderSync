"use client";

import { useTranslations } from "next-intl";
import { Inbox } from "lucide-react";
import type { MainTabTypes } from "@/types/orders";

const tabMessageKeys: Record<MainTabTypes, string> = {
  RECEIVED: "noOrdersReceived",
  PREPARING: "noOrdersPreparing",
  DELIVERY: "noOrdersDelivery",
  COMPLETED: "noOrdersCompleted",
  VOIDED: "noOrdersVoided",
};

export default function NoOrders({ activeTab }: { activeTab: MainTabTypes }) {
  const t = useTranslations("Orders.view");

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-6">
        <Inbox className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">
        {t("noOrdersFound")}
      </h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        {t(tabMessageKeys[activeTab])}
      </p>
    </div>
  );
}
