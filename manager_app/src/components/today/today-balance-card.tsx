"use client";

import { useTranslations } from "next-intl";
import type { BalanceSummary } from "@/lib/types/types";
import { Wallet, CheckCircle2, XCircle } from "lucide-react";

interface TodayBalanceCardProps {
  balance: BalanceSummary;
}

export function TodayBalanceCard({ balance }: TodayBalanceCardProps) {
  const t = useTranslations("Dashboard.today.balance");
  const total = balance.paid + balance.unpaid;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
      <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
        <Wallet className="w-4 h-4" />
        {t("title")}
      </h3>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/10">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("paid")}</p>
            <p className="text-sm font-bold text-card-foreground">
              {balance.paid.toFixed(0)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {balance.paidCount} {t("orders")}
            </p>
          </div>
        </div>

        <div className="h-8 w-px bg-border" />

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("unpaid")}</p>
            <p className="text-sm font-bold text-card-foreground">
              {balance.unpaid.toFixed(0)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {balance.unpaidCount} {t("orders")}
            </p>
          </div>
        </div>
      </div>

      {total > 0 && (
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${(balance.paid / total) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
