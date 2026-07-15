"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFetchPickUpOrdersQuery } from "@/rtk/api/firestoreApi";
import { useOrderActions } from "@/hooks/useOrderActions";
import { useAppSelector } from "@/rtk/hooks";
import { selectUser } from "@/rtk/slices/authSlice";
import { OrderMap } from "@/components/orders/OrderMap";
import { ArrowLeft, MapPin, Phone, User } from "lucide-react";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("accessToken") ?? "";

  const authUser = useAppSelector(selectUser);
  const driverUid = authUser?.uid ?? "";

  const { data: orders } = useFetchPickUpOrdersQuery(
    { accessToken, driverUid },
    { skip: !accessToken || !driverUid },
  );
  const { pickUpOrder, isLoading: isPickingUp } = useOrderActions();

  const order = orders?.find((o) => o.id === orderId);
  const compositeOrderId = order
    ? `${order.id}_${order.customer?.uid}`
    : "";

  const [driverLocation, setDriverLocation] = useState<
    [number, number] | null
  >(null);

  const handlePickUp = useCallback(async () => {
    if (!order || !accessToken || !driverUid || !compositeOrderId) return;
    try {
      await pickUpOrder(order.id, compositeOrderId, accessToken, driverUid);
      router.push("/orders");
    } catch {
      alert("Failed to pick up order");
    }
  }, [order, accessToken, driverUid, compositeOrderId, pickUpOrder, router]);

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

  const orderLocation = order.location?.latlng;
  const hasOrderLocation =
    orderLocation && orderLocation[0] && orderLocation[1];
  const hasDriverLocation =
    driverLocation && driverLocation[0] && driverLocation[1];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 hover:bg-accent rounded-md">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold">
            #{orderId.slice(-6).toUpperCase()}
          </h1>
          <p className="text-xs text-muted-foreground">Order Details</p>
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
            {order.location?.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">{order.location.address}</span>
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
              {order.cartTotalPrice?.total?.toFixed(2) ?? "0.00"}
            </span>
          </div>
        </section>

        {order.orderNote && (
          <section className="border rounded-lg p-4">
            <h2 className="font-semibold text-sm mb-1">Note</h2>
            <p className="text-sm text-muted-foreground">{order.orderNote}</p>
          </section>
        )}
      </main>

      <div className="sticky bottom-0 bg-background border-t p-4">
        <button
          onClick={handlePickUp}
          disabled={isPickingUp}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isPickingUp ? "Picking Up..." : "Pick Up Order"}
        </button>
      </div>
    </div>
  );
}
