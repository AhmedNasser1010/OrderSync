"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { OrderType, OrderStatusType } from "@ordersync/types";
import type { useOrderActions } from "@/hooks/useOrderActions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useBusinessDisplayName } from "@/contexts/BusinessNamesContext";
import {
  MapPin,
  ShoppingBag,
  Store,
  Phone,
  AlarmClock,
} from "lucide-react";

export const STATUS_CONFIG: Record<
  OrderStatusType,
  { color: string; dot: string; accent: string; progress: number }
> = {
  RESERVED: {
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    dot: "bg-blue-500",
    accent: "border-l-blue-500",
    progress: 1,
  },
  PICKED_UP: {
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    dot: "bg-amber-500",
    accent: "border-l-amber-500",
    progress: 2,
  },
  ON_ROUTE: {
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    dot: "bg-purple-500",
    accent: "border-l-purple-500",
    progress: 3,
  },
  DELIVERED: {
    color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    dot: "bg-green-500",
    accent: "border-l-green-500",
    progress: 3,
  },
  READY: {
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    dot: "bg-emerald-500",
    accent: "border-l-emerald-500",
    progress: 0,
  },
  RECEIVED: {
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300",
    dot: "bg-gray-500",
    accent: "border-l-gray-400",
    progress: 0,
  },
  ACCEPTED: {
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300",
    dot: "bg-gray-500",
    accent: "border-l-gray-400",
    progress: 0,
  },
  PREPARING: {
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300",
    dot: "bg-gray-500",
    accent: "border-l-gray-400",
    progress: 0,
  },
  GIVEN_FEEDBACK: {
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300",
    dot: "bg-gray-500",
    accent: "border-l-gray-400",
    progress: 0,
  },
  CANCELED: {
    color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    dot: "bg-red-500",
    accent: "border-l-red-500",
    progress: 0,
  },
  REJECTED: {
    color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    dot: "bg-red-500",
    accent: "border-l-red-500",
    progress: 0,
  },
  VOIDED: {
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300",
    dot: "bg-gray-500",
    accent: "border-l-gray-400",
    progress: 0,
  },
};

export function getStatusBadgeClass(status: OrderStatusType): string {
  return STATUS_CONFIG[status]?.color ?? STATUS_CONFIG.READY.color;
}

export const STATUS_TRANSLATION_KEY: Record<OrderStatusType, string> = {
  RESERVED: "reserved",
  PICKED_UP: "pickedUp",
  ON_ROUTE: "onRoute",
  DELIVERED: "delivered",
  READY: "available",
  RECEIVED: "received",
  ACCEPTED: "accepted",
  PREPARING: "preparing",
  GIVEN_FEEDBACK: "feedback",
  CANCELED: "canceled",
  REJECTED: "rejected",
  VOIDED: "voided",
};

const PROGRESS_STEPS = [
  "reserved",
  "pickedUp",
  "onRoute",
] as const;

const STALE_WARNING_MS = 3 * 60 * 1000;
const STALE_CRITICAL_MS = 7 * 60 * 1000;

type StaleLevel = "none" | "warning" | "critical";

function getStaleLevel(readyAt: number): StaleLevel {
  const elapsed = Date.now() - readyAt;
  if (elapsed >= STALE_CRITICAL_MS) return "critical";
  if (elapsed >= STALE_WARNING_MS) return "warning";
  return "none";
}

function ProgressStepper({ current }: { current: OrderStatusType }) {
  const t = useTranslations("orderCard");
  const currentProgress = STATUS_CONFIG[current]?.progress ?? 0;

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center gap-2">
        {PROGRESS_STEPS.map((stepKey, i) => {
          const isActive = i + 1 <= currentProgress;
          const isCurrent = i + 1 === currentProgress;
          return (
            <div key={stepKey} className="flex items-center flex-1 gap-2">
              <div
                className={cn(
                  "size-2.5 rounded-full shrink-0 transition-colors",
                  isActive ? "bg-primary" : "bg-border",
                  isCurrent && "ring-2 ring-primary/30"
                )}
              />
              {i < PROGRESS_STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    isActive ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between">
        {PROGRESS_STEPS.map((stepKey, i) => {
          const isActive = i + 1 <= currentProgress;
          return (
            <span
              key={stepKey}
              className={cn(
                "text-[10px] w-16 text-center",
                isActive
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {t(stepKey)}
            </span>
          );
        })}
      </div>
    </div>
  );
}

interface OrderCardProps {
  order: OrderType;
  variant: "marketplace" | "active";
  driverUid?: string;
  actions?: ReturnType<typeof useOrderActions>;
}

export function OrderCard({
  order,
  variant,
  driverUid,
  actions,
}: OrderCardProps) {
  const t = useTranslations("orderCard");
  const status = order.status?.current as OrderStatusType;
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.READY;
  const address = order.delivery?.address ?? "";
  const customerName = order.customer?.name ?? "";
  const customerPhone = order.customer?.phone ?? "";
  const businessName = useBusinessDisplayName(order.business?.id, order.business?.name);
  const totalPrice = order.pricing?.total ?? 0;
  const itemCount = order.cart?.length ?? 0;
  const displayTime =
    variant === "active"
      ? order.updatedAt
      : (order.timeline?.readyAt ?? order.createdAt);

  const readyAt = order.timeline?.readyAt ?? order.createdAt;
  const [staleLevel, setStaleLevel] = useState<StaleLevel>(
    variant === "marketplace" ? getStaleLevel(readyAt) : "none"
  );

  useEffect(() => {
    if (variant !== "marketplace") return;
    const id = setInterval(() => {
      setStaleLevel(getStaleLevel(readyAt));
    }, 30_000);
    return () => clearInterval(id);
  }, [variant, readyAt]);

  const isWarning = staleLevel === "warning";
  const isCritical = staleLevel === "critical";
  const isStale = isWarning || isCritical;

  const handleAction = useCallback(
    async (e: React.MouseEvent, action: () => Promise<void>) => {
      e.stopPropagation();
      try {
        await action();
      } catch {
        alert(t("actionFailed"));
      }
    },
    [t]
  );

  const cardDisplay = (
    <div className="space-y-3">
      {/* Header: Status + Order # */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "size-2 rounded-full shrink-0",
              isCritical && "bg-red-500 animate-pulse",
              isWarning && "bg-amber-500 animate-pulse",
              !isStale && config.dot
            )}
          />
          <span
            className={cn(
              "text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full",
              isCritical &&
                "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
              isWarning &&
                "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
              !isStale && config.color
            )}
          >
            {isCritical
              ? t("urgent")
              : isWarning
                ? t("waiting")
                : t(STATUS_TRANSLATION_KEY[status] ?? "available")}
          </span>
        </div>
        <span className="text-sm font-bold tabular-nums">
          #{order.orderNumber}
        </span>
      </div>

      {/* Restaurant + Address */}
      <div className="space-y-1.5">
        {businessName && (
          <div className="flex items-center gap-1.5">
            <Store className="size-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium truncate">{businessName}</span>
          </div>
        )}
        {address && (
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {address}
            </span>
          </div>
        )}
      </div>

      {/* Customer + Price / Items + Time */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="truncate text-muted-foreground">{customerName}</span>
        </div>
        <span className="font-semibold tabular-nums shrink-0 ml-2">
          {totalPrice.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShoppingBag className="size-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {t(itemCount === 1 ? "item" : "items", { count: itemCount })}
          </span>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5",
            isCritical && "text-red-600 dark:text-red-400",
            isWarning && "text-amber-600 dark:text-amber-400",
            !isStale && "text-muted-foreground"
          )}
        >
          {isStale && <AlarmClock className="size-3.5 shrink-0" />}
          <span className="text-xs font-medium">
            {formatRelativeTime(displayTime)}
          </span>
        </div>
      </div>

      {/* Progress Stepper (active only) */}
      {variant === "active" && <ProgressStepper current={status} />}
    </div>
  );

  const cardActions =
    variant === "active" && actions && driverUid ? (
      <div className="flex gap-2 pt-1">
        {status === "RESERVED" && (
          <>
            <Button
              size="lg"
              className="flex-1"
              onClick={(e) =>
                handleAction(e, () => actions.start(order.id, driverUid))
              }
              disabled={actions.isLoading}
            >
              {t("startDelivery")}
            </Button>
            <Button
              size="lg"
              variant="destructive"
              onClick={(e) =>
                handleAction(e, () => actions.cancel(order.id, driverUid))
              }
              disabled={actions.isLoading}
            >
              {t("cancel")}
            </Button>
          </>
        )}
        {status === "PICKED_UP" && (
          <>
            <a href={`tel:${customerPhone}`}>
              <Button size="lg" variant="outline" className="gap-1.5" asChild>
                <span>
                  <Phone className="size-3.5" />
                  {t("call")}
                </span>
              </Button>
            </a>
            <Button
              size="lg"
              className="flex-1"
              onClick={(e) =>
                handleAction(e, () =>
                  actions.startRoute(order.id, driverUid)
                )
              }
              disabled={actions.isLoading}
            >
              {t("startRoute")}
            </Button>
            <Button
              size="lg"
              variant="destructive"
              onClick={(e) =>
                handleAction(e, () => actions.cancel(order.id, driverUid))
              }
              disabled={actions.isLoading}
            >
              {t("cancel")}
            </Button>
          </>
        )}
        {status === "ON_ROUTE" && (
          <>
            <a href={`tel:${customerPhone}`}>
              <Button size="lg" variant="outline" className="gap-1.5" asChild>
                <span>
                  <Phone className="size-3.5" />
                  {t("call")}
                </span>
              </Button>
            </a>
            <Button
              size="lg"
              className="flex-1 bg-green-600 text-white hover:bg-green-700"
              onClick={(e) =>
                handleAction(e, () =>
                  actions.complete(order.id, driverUid)
                )
              }
              disabled={actions.isLoading}
            >
              {t("completeDelivery")}
            </Button>
            <Button
              size="lg"
              variant="destructive"
              onClick={(e) =>
                handleAction(e, () => actions.cancel(order.id, driverUid))
              }
              disabled={actions.isLoading}
            >
              {t("cancel")}
            </Button>
          </>
        )}
      </div>
    ) : null;

  const sharedClasses = cn(
    "border-l-4 p-4 transition-shadow active:scale-[0.98]",
    isCritical && variant === "marketplace" && "border-l-red-500",
    isWarning && variant === "marketplace" && "border-l-amber-500",
    !isStale && config.accent,
    variant === "marketplace" && "hover:shadow-md cursor-pointer"
  );

  if (variant === "marketplace") {
    return (
      <Link href={`/orders/${order.id}`} className="block">
        <Card className={sharedClasses}>{cardDisplay}</Card>
      </Link>
    );
  }

  return (
    <Card className={sharedClasses}>
      <Link href={`/orders/${order.id}`} className="block">
        {cardDisplay}
      </Link>
      {cardActions}
    </Card>
  );
}
