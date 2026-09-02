"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  Wallet,
  Coins,
  Clock,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useAuthSession } from "@/hooks/useAuthSession";
import {
  useFetchWalletBalanceQuery,
  useFetchWalletCreditsQuery,
  useFetchWalletTransactionsQuery,
} from "@/rtk/api/firestoreApi";
import {
  type WalletCredit,
  type WalletTransaction,
} from "@ordersync/types";

const SOURCE_LABEL_KEYS: Record<string, string> = {
  CAMPAIGN: "Campaign Bonus",
  ADMIN_ADJUST: "Admin Adjustment",
  ORDER_EARN: "Cashback",
  WELCOME: "Welcome Bonus",
  WINBACK: "Win-Back Bonus",
};

const TYPE_ICONS: Record<string, typeof Coins> = {
  GRANT: TrendingUp,
  REDEEM: TrendingDown,
  EXPIRE: Clock,
  CLAWBACK: RotateCcw,
  ADMIN_ADJUST: TrendingUp,
};

function formatAmount(amount: number, t: (key: string) => string): string {
  return `${amount.toFixed(2)} ${t("EGP")}`;
}

function formatDate(ts: number, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleDateString();
  }
}

function daysLeft(expiresAt: number, t: ReturnType<typeof useTranslations>): string {
  const days = Math.max(0, Math.ceil((expiresAt - Date.now()) / 86400000));
  return days === 0 ? t("Today") : t("daysLeft", { count: days });
}

export default function WalletPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { uid } = useAuthSession();

  const {
    data: balance = 0,
  } = useFetchWalletBalanceQuery(uid ?? "", { skip: !uid });
  const {
    data: credits = [],
  } = useFetchWalletCreditsQuery(uid ?? "", { skip: !uid });
  const {
    data: transactions = [],
  } = useFetchWalletTransactionsQuery(uid ?? "", { skip: !uid });

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 pb-40 pt-6 sm:px-6 lg:pt-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          aria-label={t("Back")}
          className="grid size-10 shrink-0 place-items-center rounded-full border border-color-7 bg-card text-color-6 transition-colors hover:bg-color-7/40"
        >
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </Link>
        <div className="flex-1">
          <h1 className="font-Beiruti text-3xl leading-none text-color-1 sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm font-ProximaNovaThin text-color-8">
            <Wallet className="size-3.5" />
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-color-2 to-[#ffab4a] p-6 text-white shadow-lg shadow-color-2/20">
        <p className="text-sm font-ProximaNovaSemiBold text-white/80">
          {t("availableBalance")}
        </p>
        <p className="mt-1 font-Beiruti text-5xl font-bold">
          {formatAmount(balance, t)}
        </p>
      </div>

      {credits.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 font-ProximaNovaBold text-lg text-color-1">
            {t("activeCredits")}
          </h2>
          <div className="space-y-3">
            {credits.map((credit: WalletCredit) => (
              <div
                key={credit.id}
                className="flex items-center justify-between rounded-2xl border border-color-7 bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                    <Coins className="size-5" />
                  </div>
                  <div>
                    <p className="font-ProximaNovaSemiBold text-color-1">
                      {t(SOURCE_LABEL_KEYS[credit.source] ?? credit.source)}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-color-8">
                      <Clock className="size-3" />
                      {daysLeft(credit.expiresAt, t)}
                    </p>
                  </div>
                </div>
                <p className="font-ProximaNovaBold text-emerald-600">
                  {formatAmount(credit.amount, t)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-3 font-ProximaNovaBold text-lg text-color-1">
          {t("history")}
        </h2>
        {transactions.length === 0 ? (
          <div className="rounded-2xl border border-color-7 bg-card p-8 text-center text-sm text-color-8">
            {t("noHistory")}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-color-7 bg-card">
            {transactions.map((tx: WalletTransaction, idx: number) => {
              const Icon =
                tx.type === "ADMIN_ADJUST" && tx.amount < 0
                  ? TrendingDown
                  : TYPE_ICONS[tx.type] ?? AlertTriangle;
              const isCredit =
                tx.type === "GRANT" ||
                (tx.type === "ADMIN_ADJUST" && tx.amount >= 0);
              const isDebit =
                tx.type === "REDEEM" ||
                tx.type === "CLAWBACK" ||
                (tx.type === "ADMIN_ADJUST" && tx.amount < 0);
              return (
                <div
                  key={tx.id}
                  className={`flex items-center justify-between gap-3 p-4 ${
                    idx !== transactions.length - 1
                      ? "border-b border-color-7"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid size-9 place-items-center rounded-full ${
                        isCredit
                          ? "bg-emerald-50 text-emerald-600"
                          : isDebit
                          ? "bg-rose-50 text-rose-500"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      <Icon className="size-4.5" />
                    </div>
                    <div>
                      <p className="font-ProximaNovaSemiBold text-color-1">
                        {t(`type.${tx.type}`)}
                      </p>
                      <p className="text-xs text-color-8">
                        {formatDate(tx.createdAt, locale)}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-ProximaNovaBold ${
                      isCredit
                        ? "text-emerald-600"
                        : isDebit
                        ? "text-rose-500"
                        : "text-amber-600"
                    }`}
                  >
                    {isCredit ? "+" : isDebit ? "−" : ""}
                    {formatAmount(Math.abs(tx.amount), t)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
