"use client";

import { Inbox, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

type NoOrdersProps = {
  title: string;
  description: string;
  searchQuery?: string;
  onClearSearch?: () => void;
};

export function NoOrders({
  title,
  description,
  searchQuery,
  onClearSearch,
}: NoOrdersProps) {
  const t = useTranslations("noOrders");
  const hasSearchQuery = Boolean(searchQuery?.trim());

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        {hasSearchQuery ? (
          <Search className="h-8 w-8 text-muted-foreground" />
        ) : (
          <Inbox className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <h2 className="mb-1 text-lg font-semibold text-foreground">{title}</h2>
      <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
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
