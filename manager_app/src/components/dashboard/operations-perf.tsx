"use client";

import { useTranslations } from "next-intl";
import { OperationMetrics } from "@/lib/types/types";
import { StatusIndicator } from "./status-indicator";
import { WidgetHelp } from "@/components/ui/widget-help";

interface OperationsPerfProps {
  metrics: OperationMetrics[];
}

export function OperationsPerf({ metrics }: OperationsPerfProps) {
  const t = useTranslations("Dashboard.operationsPerf");

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
      <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-1">
        {t("title")}
        <WidgetHelp widgetKey="operationsPerf" />
      </h3>
      <div className="space-y-3">
        {metrics.map((metric, idx) => (
          <div key={idx} className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-card-foreground mb-1">
                {t(metric.type)}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(`${metric.type}Benchmark`, { target: metric.target })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-card-foreground mb-1">
                {metric.unit === "minutes"
                  ? `${metric.value} ${t("minutes")}`
                  : `${metric.value}%`}
              </p>
              <StatusIndicator status={metric.status} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
