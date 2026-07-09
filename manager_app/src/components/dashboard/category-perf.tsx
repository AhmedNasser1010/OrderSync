"use client";

import { useTranslations } from "next-intl";
import { Category } from "@/lib/types/types";
import { StatusIndicator } from "./status-indicator";
import { WidgetHelp } from "@/components/ui/widget-help";

interface CategoryPerfProps {
  categories: Category[];
}

export function CategoryPerf({ categories }: CategoryPerfProps) {
  const t = useTranslations("Dashboard.categoryPerf");

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
      <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-1">
        {t("title")}
        <WidgetHelp widgetKey="categoryPerf" />
      </h3>
      <div className="space-y-4">
        {categories.map((cat, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-card-foreground">
                {cat.name}
              </p>
              <span className="text-xs font-semibold text-muted-foreground">
                ${cat.revenue}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: `
                    ${
                      cat.status === "good"
                        ? "var(--chart-2)"
                        : cat.status === "warning"
                          ? "var(--chart-3)"
                          : "var(--chart-4)"
                    }
                  `,
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {cat.percentage}%
              </span>
              <StatusIndicator status={cat.status} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
