"use client";

import { useOrders } from "@/hooks/useOrders";
import { OrderCard } from "@/components/orders/OrderCard";
import { Package, Store } from "lucide-react";

export default function OrdersPage() {
  const { orders, accessToken, isLoading, error, hasQueue } = useOrders();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-2">
        <div className="animate-spin">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
        <p className="text-sm text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-2">
        <p className="text-sm text-destructive">Failed to load orders</p>
      </div>
    );
  }

  if (!hasQueue) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
          <h1 className="text-lg font-semibold">Pick Up Orders</h1>
        </header>
        <main className="flex-1 p-4">
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
            <Store className="h-12 w-12 text-muted-foreground/50" />
            <div className="text-center">
              <p className="text-sm font-medium">No restaurants assigned</p>
              <p className="text-xs text-muted-foreground">
                Contact your manager to get assigned to a restaurant
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <h1 className="text-lg font-semibold">Pick Up Orders</h1>
        <p className="text-xs text-muted-foreground">
          {orders.length} order{orders.length !== 1 ? "s" : ""} ready
        </p>
      </header>

      <main className="flex-1 p-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
            <Package className="h-12 w-12 text-muted-foreground/50" />
            <div className="text-center">
              <p className="text-sm font-medium">No orders to pick up</p>
              <p className="text-xs text-muted-foreground">
                New orders will appear here
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                accessToken={accessToken}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
