"use client";

import { useTranslations } from "next-intl";
import { Lightbulb } from "lucide-react";
import type { AIInsight } from "@/lib/types/types";
import { WidgetHelp } from "@/components/ui/widget-help";

interface InsightsCardProps {
  insights: AIInsight[];
}

function InsightText({ insight, t }: { insight: AIInsight; t: (key: string, values?: Record<string, any>) => string }) {
  switch (insight.type) {
    case "bestSeller":
      return <>{t("bestSeller", { item: insight.itemName })}</>;
    case "strongRetention":
      return <>{t("strongRetention", { percentage: insight.percentage })}</>;
    case "topCategory":
      return <>{t("topCategory", { category: insight.categoryName, percentage: insight.percentage })}</>;
  }
}

export function InsightsCard({ insights }: InsightsCardProps) {
  const t = useTranslations("Dashboard.insights");

  return (
    <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mx-4 my-3">
      <div className="flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-1">
            {t("title")}
            <WidgetHelp widgetKey="insights" />
          </h3>
          <div className="space-y-2">
            {insights.map((insight, idx) => (
              <p
                key={idx}
                className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed"
              >
                <InsightText insight={insight} t={t} />
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
