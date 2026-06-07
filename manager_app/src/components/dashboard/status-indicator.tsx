"use client";

import { StatusType } from "@/lib/types/types";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusIndicator({
  status,
  label,
  size = "md",
}: StatusIndicatorProps) {
  const statusConfig = {
    good: {
      bg: "bg-green-100 dark:bg-green-950",
      text: "text-green-700 dark:text-green-300",
      icon: CheckCircle,
    },
    warning: {
      bg: "bg-amber-100 dark:bg-amber-950",
      text: "text-amber-700 dark:text-amber-300",
      icon: AlertTriangle,
    },
    alert: {
      bg: "bg-red-100 dark:bg-red-950",
      text: "text-red-700 dark:text-red-300",
      icon: AlertCircle,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bg}`}
    >
      <Icon className={`${sizeMap[size]} ${config.text}`} />
      {label && (
        <span className={`text-sm font-medium ${config.text}`}>{label}</span>
      )}
    </div>
  );
}
