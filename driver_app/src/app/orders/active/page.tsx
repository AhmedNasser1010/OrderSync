"use client";

import Link from "next/link";
import { useMyOrders } from "@/hooks/useOrders";
import { useOrderActions } from "@/hooks/useOrderActions";
import { useAuth } from "@/contexts/AuthContext";
import type { OrderType, OrderStatusType } from "@ordersync/types";
import { MapPin, Phone, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { OrderSearchBar } from "@/components/orders/OrderSearchBar";
import { NoOrders } from "@/components/orders/NoOrders";

const STATUS_CONFIG: Record<
  OrderStatusType,
  { label: string; color: string; dot: string; progress: number }
> = {
  RESERVED: {
    label: "Reserved",
    color: "bg-blue-100 text-blue-800",
    dot: "bg-blue-500",
    progress: 1,
  },
  PICKED_UP: {
    label: "Picked Up",
    color: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
    progress: 2,
  },
  ON_ROUTE: {
    label: "On Route",
    color: "bg-purple-100 text-purple-800",
    dot: "bg-purple-500",
    progress: 3,
  },
  DELIVERED: {
    label: "Delivered",
    color: "bg-green-100 text-green-800",
    dot: "bg-green-500",
    progress: 3,
  },
  READY: { label: "Ready", color: "bg-gray-100 text-gray-800", dot: "bg-gray-500", progress: 0 },
  RECEIVED: { label: "Received", color: "bg-gray-100 text-gray-800", dot: "bg-gray-500", progress: 0 },
  ACCEPTED: { label: "Accepted", color: "bg-gray-100 text-gray-800", dot: "bg-gray-500", progress: 0 },
  PREPARING: { label: "Preparing", color: "bg-gray-100 text-gray-800", dot: "bg-gray-500", progress: 0 },
  GIVEN_FEEDBACK: { label: "Feedback", color: "bg-gray-100 text-gray-800", dot: "bg-gray-500", progress: 0 },
  CANCELED: { label: "Canceled", color: "bg-red-100 text-red-800", dot: "bg-red-500", progress: 0 },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800", dot: "bg-red-500", progress: 0 },
  VOIDED: { label: "Voided", color: "bg-gray-100 text-gray-800", dot: "bg-gray-500", progress: 0 },
};

const PROGRESS_STEPS = [
  { status: "RESERVED", label: "Reserved" },
  { status: "PICKED_UP", label: "Picked Up" },
  { status: "ON_ROUTE", label: "On Route" },
] as const;

function ProgressStepper({ current }: { current: OrderStatusType }) {
  const currentProgress = STATUS_CONFIG[current]?.progress ?? 0;

  return (
    <div className="flex items-center gap-1 w-full">
      {PROGRESS_STEPS.map((step, i) => {
        const isActive = i + 1 <= currentProgress;
        return (
          <div key={step.status} className="flex items-center flex-1">
            <div
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                isActive ? "bg-primary" : "bg-border"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}

function matchesSearch(order: OrderType, query: string) {
  const haystack = [
    order.id,
    `#${order.orderNumber}`,
    order.orderNumber.toString(),
    order.customer?.name ?? "",
    order.business?.name ?? "",
    order.delivery?.address ?? "",
    order.status?.current ?? "",
    order.cart
      ?.map((item) => `${item.name} ${item.selectedSize} ${item.quantity}`)
      .join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function ActiveOrderCard({
  order,
  driverUid,
  actions,
}: {
  order: OrderType;
  driverUid: string;
  actions: ReturnType<typeof useOrderActions>;
}) {
  const status = order.status?.current as OrderStatusType;
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.READY;
  const address = order.delivery?.address ?? "";
  const customerName = order.customer?.name ?? "";
  const customerPhone = order.customer?.phone ?? "";
  const totalPrice = order.pricing?.total ?? 0;

  const handleAction = useCallback(
    async (e: React.MouseEvent, action: () => Promise<void>) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await action();
      } catch {
        alert("Action failed. Please try again.");
      }
    },
    [],
  );

  return (
    <Link href={`/orders/${order.id}`}>
      <div className="border rounded-lg p-4 active:scale-[0.98] transition-transform">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">#{order.orderNumber}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${config.color}`}>
                {config.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">{customerName}</p>
            {address && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground truncate">{address}</p>
              </div>
            )}
          </div>
          <div className="text-right shrink-0 ml-2">
            <p className="font-semibold text-sm">{totalPrice.toFixed(2)}</p>
            <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 ml-auto" />
          </div>
        </div>

        <ProgressStepper current={status} />

        <div className="flex gap-2 mt-3">
          {status === "RESERVED" && (
            <>
              <button
                onClick={(e) =>
                  handleAction(e, () => actions.start(order.id, driverUid))
                }
                disabled={actions.isLoading}
                className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 active:scale-[0.98]"
              >
                Start Delivery
              </button>
              <button
                onClick={(e) =>
                  handleAction(e, () => actions.cancel(order.id, driverUid))
                }
                disabled={actions.isLoading}
                className="px-3 py-2 rounded-lg text-xs font-semibold border border-destructive text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 active:scale-[0.98]"
              >
                Cancel
              </button>
            </>
          )}
          {status === "PICKED_UP" && (
            <>
              <a
                href={`tel:${customerPhone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-border hover:bg-accent transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                Call
              </a>
              <button
                onClick={(e) =>
                  handleAction(e, () => actions.startRoute(order.id, driverUid))
                }
                disabled={actions.isLoading}
                className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 active:scale-[0.98]"
              >
                Start Route
              </button>
              <button
                onClick={(e) =>
                  handleAction(e, () => actions.cancel(order.id, driverUid))
                }
                disabled={actions.isLoading}
                className="px-3 py-2 rounded-lg text-xs font-semibold border border-destructive text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 active:scale-[0.98]"
              >
                Cancel
              </button>
            </>
          )}
          {status === "ON_ROUTE" && (
            <>
              <a
                href={`tel:${customerPhone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-border hover:bg-accent transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                Call
              </a>
              <button
                onClick={(e) =>
                  handleAction(e, () => actions.complete(order.id, driverUid))
                }
                disabled={actions.isLoading}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 active:scale-[0.98]"
              >
                Complete Delivery
              </button>
              <button
                onClick={(e) =>
                  handleAction(e, () => actions.cancel(order.id, driverUid))
                }
                disabled={actions.isLoading}
                className="px-3 py-2 rounded-lg text-xs font-semibold border border-destructive text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 active:scale-[0.98]"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ActiveOrdersPage() {
  const { user } = useAuth();
  const driverUid = user?.uid ?? "";
  const { orders, isLoading, error } = useMyOrders();
  const actions = useOrderActions();
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const isSearching = normalizedSearch.length > 0;

  const visibleOrders = useMemo(() => {
    if (!isSearching) return orders;
    return orders.filter((order) => matchesSearch(order, normalizedSearch));
  }, [isSearching, normalizedSearch, orders]);

  const isSearchEmpty = isSearching && visibleOrders.length === 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-destructive">Failed to load orders</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4">
        <OrderSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search orders by number, customer, item, or status"
        />
        <p className="text-xs text-muted-foreground">
          {visibleOrders.length} active order
          {visibleOrders.length !== 1 ? "s" : ""} of {orders.length}
        </p>
      </div>

      {isSearchEmpty ? (
        <NoOrders
          title="No matching orders"
          description="Try a different order number, customer name, item, or status"
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery("")}
        />
      ) : orders.length === 0 ? (
        <NoOrders
          title="No active orders"
          description="Claim an order from the Marketplace to get started"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {visibleOrders.map((order) => (
            <ActiveOrderCard
              key={order.id}
              order={order}
              driverUid={driverUid}
              actions={actions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
