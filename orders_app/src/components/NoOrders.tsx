"use client";

import { useTranslations } from "next-intl";
import { Inbox, Search } from "lucide-react";
import type { MainTabTypes } from "@/types/orders";
import { Button } from "@/components/ui/button";

const tabMessageKeys: Record<MainTabTypes, string> = {
  RECEIVED: "noOrdersReceived",
  PREPARING: "noOrdersPreparing",
  DELIVERY: "noOrdersDelivery",
  COMPLETED: "noOrdersCompleted",
  VOIDED: "noOrdersVoided",
};

type NoOrdersProps = {
  activeTab: MainTabTypes;
  searchQuery?: string;
  onClearSearch?: () => void;
};

export default function NoOrders({
  activeTab,
  searchQuery,
  onClearSearch,
}: NoOrdersProps) {
  const t = useTranslations("Orders.view");
  const hasSearchQuery = Boolean(searchQuery?.trim());

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-6">
        {hasSearchQuery ? (
          <Search className="w-8 h-8 text-muted-foreground" />
        ) : (
          <Inbox className="w-8 h-8 text-muted-foreground" />
        )}
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">
        {hasSearchQuery ? t("noSearchResultsTitle") : t("noOrdersFound")}
      </h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        {hasSearchQuery
          ? t("noSearchResultsDescription")
          : t(tabMessageKeys[activeTab])}
      </p>
      {hasSearchQuery && onClearSearch && (
        <Button
          variant="outline"
          size="sm"
          className="mt-5"
          onClick={onClearSearch}
        >
          {t("clearSearch")}
        </Button>
      )}
    </div>
  );
}
