"use client";

import { useMarketplaceOrders } from "@/hooks/useOrders";
import { useOrderActions } from "@/hooks/useOrderActions";
import { useAppSelector } from "@/rtk/hooks";
import { selectUser } from "@/rtk/slices/authSlice";
import { OrderCard } from "@/components/orders/OrderCard";
import { Package, Store } from "lucide-react";

export default function OrdersPage() {
  const authUser = useAppSelector(selectUser);
  const driverUid = authUser?.uid ?? "";
  const { orders, isLoading, error } = useMarketplaceOrders();
  const { claim, isLoading: isClaiming } = useOrderActions();

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

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <h1 className="text-lg font-semibold">Marketplace</h1>
        <p className="text-xs text-muted-foreground">
          {orders.length} order{orders.length !== 1 ? "s" : ""} available
        </p>
      </header>

      <main className="flex-1 p-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
            <Package className="h-12 w-12 text-muted-foreground/50" />
            <div className="text-center">
              <p className="text-sm font-medium">No orders available</p>
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
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
