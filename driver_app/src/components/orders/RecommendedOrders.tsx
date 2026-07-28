"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useClaimOrderMutation,
  useClaimOrdersBatchMutation,
} from "@/rtk/api/firestoreApi";
import { useRecommendedOrders } from "@/hooks/useRecommendedOrders";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { OrderType } from "@ordersync/types";
import {
  Sparkles,
  Store,
  Navigation,
  Route,
  ChevronRight,
  ShoppingBag,
  AlarmClock,
} from "lucide-react";

const STALE_WARNING_MS = 3 * 60 * 1000;
const STALE_CRITICAL_MS = 7 * 60 * 1000;

type StaleLevel = "none" | "warning" | "critical";

function getStaleLevel(readyAt: number): StaleLevel {
  const elapsed = Date.now() - readyAt;
  if (elapsed >= STALE_CRITICAL_MS) return "critical";
  if (elapsed >= STALE_WARNING_MS) return "warning";
  return "none";
}

function formatMeters(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

function IndividualOrder({
  order,
  driverUid,
  onClaim,
}: {
  order: OrderType;
  driverUid: string;
  onClaim: (orderId: string) => void;
}) {
  const [claimOrder, { isLoading }] = useClaimOrderMutation();
  const [error, setError] = useState<string | null>(null);

  const readyAt = order.timeline?.readyAt ?? order.createdAt;
  const [staleLevel, setStaleLevel] = useState<StaleLevel>(
    getStaleLevel(readyAt),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setStaleLevel(getStaleLevel(readyAt));
    }, 30_000);
    return () => clearInterval(id);
  }, [readyAt]);

  const isWarning = staleLevel === "warning";
  const isCritical = staleLevel === "critical";
  const isStale = isWarning || isCritical;

  const handleClaim = useCallback(async () => {
    setError(null);
    try {
      const result = await claimOrder({ orderId: order.id, driverUid });
      if ("error" in result) {
        setError("Already taken");
        return;
      }
      onClaim(order.id);
    } catch {
      setError("Failed to claim");
    }
  }, [claimOrder, order.id, driverUid, onClaim]);

  const itemCount = order.cart?.length ?? 0;
  const totalPrice = order.pricing?.total ?? 0;

  return (
    <Card
      className={cn(
        "border-l-4 p-3",
        isCritical && "border-l-red-500",
        isWarning && "border-l-amber-500",
        !isStale && "border-l-emerald-500/50",
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "size-2 rounded-full shrink-0",
                isCritical && "bg-red-500 animate-pulse",
                isWarning && "bg-amber-500 animate-pulse",
                !isStale && "bg-emerald-500",
              )}
            />
            <span className="text-xs text-muted-foreground truncate">
              {order.delivery.address}
            </span>
          </div>
          <span className="text-sm font-bold tabular-nums shrink-0 ml-2">
            #{order.orderNumber}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1",
                isCritical && "text-red-600 dark:text-red-400",
                isWarning && "text-amber-600 dark:text-amber-400",
                !isStale && "text-muted-foreground",
              )}
            >
              {isStale && <AlarmClock className="size-3 shrink-0" />}
              <span className="text-xs font-medium">
                {formatRelativeTime(readyAt)}
              </span>
            </div>
            <span className="font-semibold text-sm tabular-nums">
              {totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <Button
          size="sm"
          className="w-full"
          onClick={handleClaim}
          disabled={isLoading}
        >
          {isLoading ? "Claiming..." : "Claim"}
        </Button>

        {error && (
          <p className="text-[11px] text-destructive text-center">{error}</p>
        )}
      </div>
    </Card>
  );
}

export function RecommendedOrders() {
  const { user } = useAuth();
  const driverUid = user?.uid ?? "";
  const { recommended, isLoading: isComputing } = useRecommendedOrders();
  const [claimOrdersBatch, { isLoading: isClaimingBatch }] =
    useClaimOrdersBatchMutation();
  const [claimError, setClaimError] = useState<string | null>(null);

  const handleClaimAll = useCallback(async () => {
    if (!recommended || !driverUid) return;

    setClaimError(null);

    try {
      const orderIds = recommended.orders.map((o) => o.id);
      const result = await claimOrdersBatch({ orderIds, driverUid });
      if ("error" in result) {
        setClaimError(
          "Failed to claim orders. They may have been taken already.",
        );
      }
    } catch {
      setClaimError("Something went wrong. Please try again.");
    }
  }, [recommended, driverUid, claimOrdersBatch]);

  const handleIndividualClaim = useCallback(() => {
    setClaimError(null);
  }, []);

  if (isComputing) return null;
  if (!recommended) return null;

  const { orders, restaurant, totalRouteDistance, savings } = recommended;

  return (
    <div className="space-y-2">
      {/* Bundle summary card */}
      <Card className="border-l-4 border-l-emerald-500 p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Recommended Route
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
          </div>

          {/* Restaurant */}
          <div className="flex items-center gap-1.5">
            <Store className="size-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium truncate">
              {restaurant.name}
            </span>
          </div>

          {/* Route info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Navigation className="size-3" />
              <span>{formatMeters(totalRouteDistance)} route</span>
            </div>
            <div className="flex items-center gap-1">
              <Route className="size-3" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Save {formatMeters(savings)}
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="rounded-md bg-muted/50 p-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {orders.reduce((sum, o) => sum + (o.cart?.length ?? 0), 0)}{" "}
                {orders.reduce((sum, o) => sum + (o.cart?.length ?? 0), 0) ===
                1
                  ? "item"
                  : "items"}{" "}
                total
              </span>
              <span className="font-semibold tabular-nums">
                {orders
                  .reduce((sum, o) => sum + (o.pricing?.total ?? 0), 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>

          {/* Claim All button */}
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={handleClaimAll}
            disabled={isClaimingBatch}
          >
            {isClaimingBatch ? (
              <>
                <div className="animate-spin">
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                </div>
                Claiming...
              </>
            ) : (
              <>
                Claim All {orders.length} Orders
                <ChevronRight className="size-4" />
              </>
            )}
          </Button>

          {claimError && (
            <p className="text-xs text-destructive text-center">
              {claimError}
            </p>
          )}
        </div>
      </Card>

      {/* Divider */}
      <div className="flex items-center gap-2 px-1">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          or claim individually
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Individual orders */}
      <div className="flex flex-col gap-2">
        {orders.map((order) => (
          <IndividualOrder
            key={order.id}
            order={order}
            driverUid={driverUid}
            onClaim={handleIndividualClaim}
          />
        ))}
      </div>
    </div>
  );
}
