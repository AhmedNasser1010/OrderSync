"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFetchMyOrdersQuery, useFetchMarketplaceOrdersQuery } from "@/rtk/api/firestoreApi";
import { useOrderActions } from "@/hooks/useOrderActions";
import { useAppSelector } from "@/rtk/hooks";
import { selectUser } from "@/rtk/slices/authSlice";
import { OrderMap } from "@/components/orders/OrderMap";
import { ArrowLeft, MapPin, Phone, User } from "lucide-react";
import type { OrderType } from "@ordersync/types";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const router = useRouter();

  const authUser = useAppSelector(selectUser);
  const driverUid = authUser?.uid ?? "";

  // Check if order is in marketplace (READY) or in my orders (RESERVED, PICKED_UP, etc.)
  const { data: marketplaceOrders } = useFetchMarketplaceOrdersQuery(driverUid, {
    skip: !driverUid,
  });
  const { data: myOrders } = useFetchMyOrdersQuery(driverUid, {
    skip: !driverUid,
  });

  const allOrders = [...(marketplaceOrders ?? []), ...(myOrders ?? [])];
  const order = allOrders.find((o) => o.id === orderId);

  const { claim, start, complete, cancel, isLoading } = useOrderActions();

  const [driverLocation, setDriverLocation] = useState<
    [number, number] | null
  >(null);

  const handleClaim = useCallback(async () => {
    if (!order || !driverUid) return;
    try {
      await claim(order.id, driverUid);
      router.push("/orders");
    } catch {
      alert("Failed to claim order");
    }
  }, [order, driverUid, claim, router]);

  const handleStartDelivery = useCallback(async () => {
    if (!order || !driverUid) return;
    try {
      await start(order.id, driverUid);
    } catch {
      alert("Failed to start delivery");
    }
  }, [order, driverUid, start]);

  const handleCompleteDelivery = useCallback(async () => {
    if (!order || !driverUid) return;
    try {
      await complete(order.id, driverUid);
      router.push("/orders");
    } catch {
      alert("Failed to complete delivery");
    }
  }, [order, driverUid, complete, router]);

  const handleCancel = useCallback(async () => {
    if (!order || !driverUid) return;
    try {
      await cancel(order.id, driverUid);
      router.push("/orders");
    } catch {
      alert("Failed to cancel order");
    }
  }, [order, driverUid, cancel, router]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setDriverLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {},
      { enableHighAccuracy: true },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-2">
        <div className="animate-spin">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
        <p className="text-sm text-muted-foreground">Loading order...</p>
      </div>
    );
  }

  const orderLocation = order.delivery?.latlng;
  const hasOrderLocation =
    orderLocation && orderLocation[0] && orderLocation[1];
  const hasDriverLocation =
    driverLocation && driverLocation[0] && driverLocation[1];

  const currentStatus = order.status?.current;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 hover:bg-accent rounded-md">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold">
            #{order.orderNumber}
          </h1>
          <p className="text-xs text-muted-foreground">{currentStatus}</p>
        </div>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-4 pb-24">
        {hasOrderLocation && (
          <OrderMap
            orderLocation={orderLocation}
            driverLocation={hasDriverLocation ? driverLocation : undefined}
          />
        )}

        <section className="border rounded-lg p-4">
          <h2 className="font-semibold text-sm mb-3">Customer</h2>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{order.customer?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a
                href={`tel:${order.customer?.phone}`}
                className="text-sm text-blue-600"
              >
                {order.customer?.phone}
              </a>
            </div>
            {order.delivery?.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">{order.delivery.address}</span>
              </div>
            )}
          </div>
        </section>

        <section className="border rounded-lg p-4">
          <h2 className="font-semibold text-sm mb-3">Items</h2>
          <div className="flex flex-col gap-2">
            {order.cart?.map((item: { id: string; quantity: number; selectedSize?: string }, index: number) => (
              <div
                key={`${item.id}-${index}`}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {item.quantity}x
                  </span>
                  <span>{item.id}</span>
                  {item.selectedSize && (
                    <span className="text-xs text-muted-foreground">
                      ({item.selectedSize})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 flex items-center justify-between">
            <span className="text-sm font-medium">Total</span>
            <span className="font-semibold">
              {order.pricing?.total?.toFixed(2) ?? "0.00"}
            </span>
          </div>
        </section>

        {order.notes?.order && (
          <section className="border rounded-lg p-4">
            <h2 className="font-semibold text-sm mb-1">Note</h2>
            <p className="text-sm text-muted-foreground">{order.notes.order}</p>
          </section>
        )}
      </main>

      <div className="sticky bottom-0 bg-background border-t p-4">
        {currentStatus === "READY" && (
          <button
            onClick={handleClaim}
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isLoading ? "Claiming..." : "Claim Order"}
          </button>
        )}
        {currentStatus === "RESERVED" && (
          <button
            onClick={handleStartDelivery}
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isLoading ? "Starting..." : "Start Delivery"}
          </button>
        )}
        {currentStatus === "PICKED_UP" && (
          <button
            onClick={handleCompleteDelivery}
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isLoading ? "Completing..." : "Complete Delivery"}
          </button>
        )}
        {(currentStatus === "RESERVED" || currentStatus === "PICKED_UP") && (
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full mt-2 bg-destructive text-destructive-foreground py-3 rounded-lg font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isLoading ? "Canceling..." : "Cancel Order"}
          </button>
        )}
      </div>
    </div>
  );
}
