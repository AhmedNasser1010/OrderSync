"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/contexts/AuthContext";
import { useOrderActions } from "@/hooks/useOrderActions";
import { STATUS_CONFIG, STATUS_TRANSLATION_KEY } from "./OrderCard";
import { cn, formatPrice, formatRelativeTime } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useBusinessDisplayName } from "@/contexts/BusinessNamesContext";
import { Button } from "@/components/ui/button";
import {
  X,
  Store,
  MapPin,
  ShoppingBag,
  Loader2,
  Navigation,
  Route,
} from "lucide-react";
import type { OrderType, OrderStatusType } from "@ordersync/types";

const STALE_WARNING_MS = 3 * 60 * 1000;
const STALE_CRITICAL_MS = 7 * 60 * 1000;

type StaleLevel = "none" | "warning" | "critical";

function getStaleLevel(readyAt: number): StaleLevel {
  const elapsed = Date.now() - readyAt;
  if (elapsed >= STALE_CRITICAL_MS) return "critical";
  if (elapsed >= STALE_WARNING_MS) return "warning";
  return "none";
}

interface MapOrderPopupProps {
  order: OrderType;
  onClose: () => void;
  onNavigate?: (destination: [number, number], label: string) => void;
}

export function MapOrderPopup({ order, onClose, onNavigate }: MapOrderPopupProps) {
  const router = useRouter();
  const { user } = useAuth();
  const driverUid = user?.uid ?? "";
  const { claim, start, startRoute, complete, isLoading, isLocked } = useOrderActions();
  const t = useTranslations("orderCard");
  const p = useTranslations("mapOrderPopup");

  const status = order.status?.current as OrderStatusType;
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.READY;

  const businessName = useBusinessDisplayName(order.business?.id, order.business?.name);
  const address = order.delivery?.address ?? "";
  const totalPrice = order.pricing?.total ?? 0;
  const itemCount = order.cart?.length ?? 0;
  const readyAt = order.timeline?.readyAt ?? order.createdAt;

  const [staleLevel, setStaleLevel] = useState<StaleLevel>(
    status === "READY" ? getStaleLevel(readyAt) : "none"
  );

  useEffect(() => {
    if (status !== "READY") return;
    const id = setInterval(() => {
      setStaleLevel(getStaleLevel(readyAt));
    }, 30_000);
    return () => clearInterval(id);
  }, [status, readyAt]);

  const isWarning = staleLevel === "warning";
  const isCritical = staleLevel === "critical";
  const isStale = isWarning || isCritical;

  const statusLabel = isCritical
    ? t("urgent")
    : isWarning
      ? t("waiting")
      : t(STATUS_TRANSLATION_KEY[status] ?? "available");

  const handleAction = useCallback(async () => {
    if (!driverUid) return;
    try {
      if (status === "READY") {
        await claim(order.id, driverUid);
        onClose();
      } else if (status === "RESERVED") {
        await start(order.id, driverUid);
        onClose();
      } else if (status === "PICKED_UP") {
        await startRoute(order.id, driverUid);
        onClose();
      } else if (status === "ON_ROUTE") {
        await complete(order.id, driverUid);
        router.push("/orders/active");
      }
    } catch {
      alert(p("actionFailed"));
    }
  }, [status, order.id, driverUid, claim, start, startRoute, complete, onClose, router, p]);

  const actionLabelKey =
    status === "READY" ? "claimOrder"
      : status === "RESERVED" ? "startDelivery"
        : status === "PICKED_UP" ? "startRoute"
          : status === "ON_ROUTE" ? "completeDelivery"
            : null;

  const isActionDisabled =
    isLoading || isLocked(order.id);

  const deliveryLatLng = order.delivery?.latlng;
  const hasLocation =
    deliveryLatLng && deliveryLatLng[0] && deliveryLatLng[1];

  const handleNavigate = useCallback(() => {
    if (!hasLocation) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${deliveryLatLng[0]},${deliveryLatLng[1]}`,
      "_blank",
    );
  }, [hasLocation, deliveryLatLng]);

  const handleInAppNavigate = useCallback(() => {
    if (!hasLocation || !onNavigate) return;
    const label = businessName || `Order #${order.orderNumber}`;
    onNavigate(deliveryLatLng as [number, number], label);
    onClose();
  }, [hasLocation, deliveryLatLng, onNavigate, businessName, order.orderNumber, onClose]);

  return (
    <div className="fixed bottom-6 left-4 right-4 z-[1100]">
      <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-xl">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                isCritical &&
                  "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
                isWarning &&
                  "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
                !isStale && config.color,
              )}
            >
              {statusLabel}
            </span>
            <span className="text-sm font-bold tabular-nums">
              #{order.orderNumber}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
            aria-label={p("close")}
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        <div className="mb-3 space-y-1.5">
          {businessName && (
            <div className="flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="text-sm font-medium">{businessName}</span>
            </div>
          )}
          {address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{address}</span>
            </div>
          )}
        </div>

        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {t(itemCount === 1 ? "item" : "items", { count: itemCount })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(readyAt)}
            </span>
            <span className="text-sm font-bold tabular-nums">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>

        {actionLabelKey && (
          <Button
            size="lg"
            className={cn(
              "h-11 w-full text-sm font-semibold",
              status === "ON_ROUTE" &&
                "bg-green-600 text-white hover:bg-green-700",
            )}
            onClick={handleAction}
            disabled={isActionDisabled}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {p("processing")}
              </>
            ) : (
              t(actionLabelKey)
            )}
          </Button>
        )}

        {hasLocation && (
          <>
            <Button
              size="lg"
              variant="outline"
              className="mt-2 h-10 w-full gap-1.5 text-sm"
              onClick={handleInAppNavigate}
            >
              <Route className="h-3.5 w-3.5" />
              {p("navigate")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="mt-2 h-10 w-full gap-1.5 text-sm"
              onClick={handleNavigate}
            >
              <Navigation className="h-3.5 w-3.5" />
              {p("maps")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
