"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useOrderActions } from "@/hooks/useOrderActions";
import useDriverFinance from "@/hooks/useDriverFinance";
import { STATUS_CONFIG } from "./OrderCard";
import { cn, formatPrice, formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  X,
  Store,
  MapPin,
  ShoppingBag,
  Loader2,
  Navigation,
} from "lucide-react";
import type { OrderType, OrderStatusType } from "@ordersync/types";

interface MapOrderPopupProps {
  order: OrderType;
  onClose: () => void;
}

export function MapOrderPopup({ order, onClose }: MapOrderPopupProps) {
  const router = useRouter();
  const { user } = useAuth();
  const driverUid = user?.uid ?? "";
  const { claim, start, startRoute, complete, isLoading } = useOrderActions();
  const { isBlocked } = useDriverFinance();

  const status = order.status?.current as OrderStatusType;
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.READY;

  const businessName = order.business?.name ?? "";
  const address = order.delivery?.address ?? "";
  const totalPrice = order.pricing?.total ?? 0;
  const itemCount = order.cart?.length ?? 0;
  const readyAt = order.timeline?.readyAt ?? order.createdAt;

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
      alert("Action failed. Please try again.");
    }
  }, [status, order.id, driverUid, claim, start, startRoute, complete, onClose, router]);

  const actionLabel =
    status === "READY"
      ? "Claim Order"
      : status === "RESERVED"
        ? "Start Delivery"
        : status === "PICKED_UP"
          ? "Start Route"
          : status === "ON_ROUTE"
            ? "Complete Delivery"
            : null;

  const isActionDisabled =
    isLoading || (status === "READY" && isBlocked);

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

  return (
    <div className="fixed bottom-6 left-4 right-4 z-[1100]">
      <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-xl">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                config.color,
              )}
            >
              {config.label}
            </span>
            <span className="text-sm font-bold tabular-nums">
              #{order.orderNumber}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
            aria-label="Close"
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
              {itemCount} {itemCount === 1 ? "item" : "items"}
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

        {actionLabel && (
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
                Processing...
              </>
            ) : status === "READY" && isBlocked ? (
              "Limit Reached"
            ) : (
              actionLabel
            )}
          </Button>
        )}

        {hasLocation && (
          <Button
            size="lg"
            variant="outline"
            className="mt-2 h-10 w-full gap-1.5 text-sm"
            onClick={handleNavigate}
          >
            <Navigation className="h-3.5 w-3.5" />
            Navigate
          </Button>
        )}
      </div>
    </div>
  );
}
