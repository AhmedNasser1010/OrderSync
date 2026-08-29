"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  SquareArrowDown,
  CookingPot,
  Bike,
  Ban,
  CircleX,
  Package,
  Truck,
  Star,
  PackageCheck,
  Sparkles,
  StickyNote,
  RotateCcw,
} from "lucide-react";
import type { OrderStatusType } from "@ordersync/types";
import { useEffect, useState, useCallback } from "react";

function getTimeAgo(timestamp: number, t: (key: string, params?: Record<string, string | number>) => string): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return t("justNow");
  if (seconds < 3600) return t("minutesAgo", { m: Math.floor(seconds / 60) });
  if (seconds < 86400) return t("hoursAgo", { h: Math.floor(seconds / 3600) });
  return t("daysAgo", { d: Math.floor(seconds / 86400) });
}

const getStatusIcon = (status: OrderStatusType) => {
  switch (status) {
    case "RECEIVED":
      return <SquareArrowDown className="h-3.5 w-3.5" />;
    case "ACCEPTED":
      return <CheckCircle className="h-3.5 w-3.5" />;
    case "PREPARING":
      return <CookingPot className="h-3.5 w-3.5" />;
    case "READY":
      return <Package className="h-3.5 w-3.5" />;
    case "RESERVED":
      return <Bike className="h-3.5 w-3.5" />;
    case "PICKED_UP":
      return <PackageCheck className="h-3.5 w-3.5" />;
    case "ON_ROUTE":
      return <Truck className="h-3.5 w-3.5" />;
    case "DELIVERED":
      return <CheckCircle className="h-3.5 w-3.5" />;
    case "GIVEN_FEEDBACK":
      return <Star className="h-3.5 w-3.5" />;
    case "REJECTED":
      return <Ban className="h-3.5 w-3.5" />;
    case "CANCELED":
      return <CircleX className="h-3.5 w-3.5" />;
    case "VOIDED":
      return <CircleX className="h-3.5 w-3.5" />;
    default:
      return null;
  }
};

const getStatusVariant = (status: OrderStatusType) => {
  switch (status) {
    case "RECEIVED":
      return "default";
    case "PREPARING":
    case "ACCEPTED":
      return "secondary";
    case "REJECTED":
    case "CANCELED":
    case "VOIDED":
      return "destructive";
    default:
      return "success";
  }
};

export default function OrderHeader({
  orderNumber,
  status,
  placedAt,
  isFirstOrder,
  note,
  returnedByDriver,
}: {
  orderNumber: number;
  status: OrderStatusType;
  placedAt: number;
  isFirstOrder?: boolean;
  note?: string;
  returnedByDriver?: boolean;
}) {
  const t = useTranslations("Orders.header");
  const st = useTranslations("Orders.statuses");
  const [timeAgo, setTimeAgo] = useState(() => getTimeAgo(placedAt, t));

  const updateTimeAgo = useCallback(() => {
    setTimeAgo(getTimeAgo(placedAt, t));
  }, [placedAt, t]);

  useEffect(() => {
    const intervalMs = status === "RECEIVED" ? 10_000 : 60_000;
    const interval = setInterval(updateTimeAgo, intervalMs);
    return () => clearInterval(interval);
  }, [placedAt, status, updateTimeAgo]);

  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">#{orderNumber}</span>
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
        {note && (
          <Badge
            className="flex items-center gap-1 text-xs border-amber-300 bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800/50 dark:text-amber-300"
          >
            <StickyNote className="h-3 w-3" />
            <span>{t("note")}</span>
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {isFirstOrder && (
          <Badge
            variant="outline"
            className="flex items-center gap-1 text-xs border-amber-300 text-amber-600"
          >
            <Sparkles className="h-3 w-3" />
            <span>{t("firstOrder")}</span>
          </Badge>
        )}
        {returnedByDriver && (
          <Badge className="flex items-center gap-1 text-xs border-amber-300 bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800/50 dark:text-amber-300">
            <RotateCcw className="h-3 w-3" />
            <span>{t("returnedByDriver")}</span>
          </Badge>
        )}
        <Badge
          variant={getStatusVariant(status)}
          className="flex items-center gap-1 text-xs"
        >
          {getStatusIcon(status)}
          <span className="capitalize">
            {st(status)}
          </span>
        </Badge>
      </div>
    </div>
  );
}
