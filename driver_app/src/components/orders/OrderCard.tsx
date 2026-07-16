"use client";

import Link from "next/link";
import type { OrderType } from "@ordersync/types";
import { MapPin, ShoppingBag } from "lucide-react";

interface OrderCardProps {
  order: OrderType;
}

export function OrderCard({ order }: OrderCardProps) {
  const totalPrice = order.pricing?.total ?? 0;
  const itemCount = order.cart?.length ?? 0;
  const address = order.delivery?.address ?? "";

  return (
    <Link href={`/orders/${order.id}`}>
      <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer active:scale-[0.98]">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">
                #{order.orderNumber}
              </span>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                {order.status?.current === "RESERVED" ? "RESERVED" : "READY"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {order.customer?.name}
            </p>
            {address && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground truncate">
                  {address}
                </p>
              </div>
            )}
          </div>
          <div className="text-right shrink-0 ml-2">
            <p className="font-semibold text-sm">{totalPrice.toFixed(2)}</p>
            <div className="flex items-center gap-1 justify-end mt-1">
              <ShoppingBag className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{itemCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
