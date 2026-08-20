"use client";

import type { OrderType } from "@ordersync/types";

function formatTimestamp(ts: number): string {
  if (!ts) return "N/A";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

export function DriverPopup({
  name,
  phone,
  isOnline,
  plate,
  lastSeen,
  cash,
}: {
  name: string;
  phone: string;
  isOnline: boolean;
  plate?: string;
  lastSeen: number;
  cash: number;
}) {
  return (
    <div className="min-w-[180px] space-y-1">
      <p className="font-semibold text-sm">{name}</p>
      <p className="text-xs text-muted-foreground">{phone}</p>
      <div className="flex items-center gap-1.5">
        <span
          className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
        />
        <span className="text-xs">{isOnline ? "Online" : "Offline"}</span>
      </div>
      {plate && <p className="text-xs text-muted-foreground">{plate}</p>}
      <p className="text-xs text-muted-foreground">
        Last seen: {formatTimestamp(lastSeen)}
      </p>
      <p className="text-xs text-muted-foreground">Remaining Advance: EGP {cash}</p>
    </div>
  );
}

export function CustomerPopup({
  name,
  phone,
  city,
  totalOrders,
}: {
  name: string;
  phone: string;
  city: string;
  totalOrders: number;
}) {
  return (
    <div className="min-w-[180px] space-y-1">
      <p className="font-semibold text-sm">{name}</p>
      <p className="text-xs text-muted-foreground">{phone}</p>
      <p className="text-xs text-muted-foreground">{city}</p>
      <p className="text-xs text-muted-foreground">Orders: {totalOrders}</p>
    </div>
  );
}

export function RestaurantPopup({
  name,
  phone,
  address,
  status,
  rating,
}: {
  name: string;
  phone: string;
  address: string;
  status: string;
  rating: number;
}) {
  return (
    <div className="min-w-[180px] space-y-1">
      <p className="font-semibold text-sm">{name}</p>
      <p className="text-xs text-muted-foreground">{phone}</p>
      <p className="text-xs text-muted-foreground">{address}</p>
      <div className="flex items-center gap-1.5">
        <span
          className={`h-2 w-2 rounded-full ${
            status === "active"
              ? "bg-green-500"
              : status === "busy"
                ? "bg-yellow-500"
                : "bg-gray-400"
          }`}
        />
        <span className="text-xs capitalize">{status}</span>
      </div>
      {rating > 0 && (
        <p className="text-xs text-muted-foreground">
          Rating: {rating.toFixed(1)}
        </p>
      )}
    </div>
  );
}

export function OrderPopup({
  order,
}: {
  order: OrderType;
}) {
  return (
    <div className="min-w-[200px] space-y-1">
      <p className="font-semibold text-sm">Order #{order.orderNumber}</p>
      <p className="text-xs text-muted-foreground">
        Customer: {order.customer?.name}
      </p>
      <p className="text-xs text-muted-foreground">
        {order.customer?.phone}
      </p>
      <p className="text-xs text-muted-foreground">
        Restaurant: {order.business?.name}
      </p>
      <p className="text-xs text-muted-foreground">
        Status: {order.status?.current?.replace("_", " ")}
      </p>
      <p className="text-xs text-muted-foreground">
        Total: EGP {order.pricing?.total}
      </p>
      <p className="text-xs text-muted-foreground">
        Placed: {formatTimestamp(order.createdAt)}
      </p>
    </div>
  );
}
