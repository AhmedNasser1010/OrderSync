"use client";

import { useTranslations } from "next-intl";
import { BusinessHealthData, StrengthItem, AlertItem } from "@/lib/types/types";
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { WidgetHelp } from "@/components/ui/widget-help";

interface BusinessScoreProps {
  data: BusinessHealthData;
}

function StrengthText({ strength, t }: { strength: StrengthItem; t: (key: string, values?: Record<string, any>) => string }) {
  switch (strength.type) {
    case "strongRetention":
      return <>{t("strongRetention", { percentage: strength.percentage })}</>;
    case "excellentCompletion":
      return <>{t("excellentCompletion", { rate: strength.rate })}</>;
    case "fastPrepTime":
      return <>{t("fastPrepTime", { minutes: strength.minutes })}</>;
    case "revenueIncrease":
      return <>{t("revenueIncrease", { growth: strength.growth })}</>;
  }
}

function AlertText({ alert, t }: { alert: AlertItem; t: (key: string, values?: Record<string, any>) => string }) {
  switch (alert.type) {
    case "lowRetention":
      return <>{t("lowRetention")}</>;
    case "lowCompletion":
      return <>{t("lowCompletion")}</>;
    case "slowPrepTime":
      return <>{t("slowPrepTime")}</>;
    case "weakCategory":
      return <>{t("weakCategory", { category: alert.categoryName, percentage: alert.percentage })}</>;
  }
}

export function BusinessScore({ data }: BusinessScoreProps) {
  const t = useTranslations("Dashboard.businessScore");
  const healthColor =
    data.score >= 80
      ? "text-green-600 dark:text-green-400"
      : data.score >= 60
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
      <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-1">
        {t("title")}
        <WidgetHelp widgetKey="businessScore" />
      </h3>

      <div className="relative mb-4">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--muted)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={
                  data.score >= 80
                    ? "var(--chart-2)"
                    : data.score >= 60
                      ? "var(--chart-3)"
                      : "var(--chart-4)"
                }
                strokeWidth="8"
                strokeDasharray={`${(data.score / data.maxScore) * 283} 283`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className={`text-2xl font-bold ${healthColor}`}>
                {data.score}
              </p>
              <p className="text-xs text-muted-foreground">{t("outOf")} {data.maxScore}</p>
            </div>
          </div>
        </div>
      </div>

      {data.strengths.length > 0 && (
        <div className="mb-3 pb-3 border-b border-border">
          <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {t("strengths")}
          </p>
          <ul className="space-y-1">
            {data.strengths.map((strength, idx) => (
              <li
                key={idx}
                className="text-xs text-card-foreground leading-relaxed"
              >
                • <StrengthText strength={strength} t={t} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.alerts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {t("areasToImprove")}
          </p>
          <ul className="space-y-1">
            {data.alerts.map((alert, idx) => (
              <li
                key={idx}
                className="text-xs text-card-foreground leading-relaxed"
              >
                • <AlertText alert={alert} t={t} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.trends.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs font-semibold text-card-foreground mb-2">
            {t("trends")}
          </p>
          <div className="space-y-1">
            {data.trends.map((trend, idx) => {
              const trendIcon =
                trend.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                );
              const trendColor =
                trend.change >= 0 ? "text-green-600" : "text-red-600";

              return (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t(trend.type)}
                  </span>
                  <div className={`flex items-center gap-1 ${trendColor}`}>
                    {trendIcon}
                    <span className="text-xs font-semibold">
                      {trend.change > 0 ? "+" : ""}
                      {trend.change}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
