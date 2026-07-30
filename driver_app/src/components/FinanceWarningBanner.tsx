"use client";

import useDriverFinance from "@/hooks/useDriverFinance";
import { AlertTriangle, Ban } from "lucide-react";
import { useTranslations } from "next-intl";

export function FinanceWarningBanner() {
  const t = useTranslations("finance");
  const { currentCash, warningLimit, blockLimit, isWarning, isBlocked, isLoading } =
    useDriverFinance();

  if (isLoading || (!isWarning && !isBlocked)) return null;

  if (isBlocked) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-sm border-b bg-red-50 text-red-800 border-red-200">
        <Ban className="h-4 w-4 shrink-0" />
        <span>
          {t("blocked", {
            amount: currentCash.toFixed(2),
            limit: blockLimit.toFixed(2),
          })}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm border-b bg-amber-50 text-amber-800 border-amber-200">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>
        {t("warning", {
          amount: currentCash.toFixed(2),
          limit: warningLimit.toFixed(2),
        })}
      </span>
    </div>
  );
}
