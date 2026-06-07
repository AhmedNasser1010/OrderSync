"use client";

import { OperationMetrics } from "@/lib/types/types";
import { StatusIndicator } from "./status-indicator";

interface OperationsPerfProps {
  metrics: OperationMetrics[];
}

export function OperationsPerf({ metrics }: OperationsPerfProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">
        Operations Performance
      </h3>
      <div className="space-y-3">
        {metrics.map((metric, idx) => (
          <div key={idx} className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-card-foreground mb-1">
                {metric.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {metric.benchmark}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-card-foreground mb-1">
                {metric.time}
              </p>
              <StatusIndicator status={metric.status} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
