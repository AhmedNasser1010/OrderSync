"use client";

import { BusinessHealthData } from "@/lib/types/types";
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface BusinessScoreProps {
  data: BusinessHealthData;
}

export function BusinessScore({ data }: BusinessScoreProps) {
  const healthColor =
    data.score >= 80
      ? "text-green-600 dark:text-green-400"
      : data.score >= 60
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">
        Business Health Score
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
              <p className="text-xs text-muted-foreground">/ {data.maxScore}</p>
            </div>
          </div>
        </div>
      </div>

      {data.strengths.length > 0 && (
        <div className="mb-3 pb-3 border-b border-border">
          <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Strengths
          </p>
          <ul className="space-y-1">
            {data.strengths.map((strength, idx) => (
              <li
                key={idx}
                className="text-xs text-card-foreground leading-relaxed"
              >
                • {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.alerts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Areas to Improve
          </p>
          <ul className="space-y-1">
            {data.alerts.map((alert, idx) => (
              <li
                key={idx}
                className="text-xs text-card-foreground leading-relaxed"
              >
                • {alert}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.trends.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs font-semibold text-card-foreground mb-2">
            Trends
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
                    {trend.label}
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
