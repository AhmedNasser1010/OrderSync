"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  useFetchMyOrdersQuery,
  useFetchMarketplaceOrdersQuery,
} from "@/rtk/api/firestoreApi";
import { useOrderActions } from "@/hooks/useOrderActions";
import { useAuth } from "@/contexts/AuthContext";
import useDriverFinance from "@/hooks/useDriverFinance";
import { OrderMap } from "@/components/orders/OrderMap";
import { cn, formatPrice, formatRelativeTime } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Navigation,
  ChevronDown,
  Clock,
  Loader2,
  Undo2,
  ExternalLink,
} from "lucide-react";
import type { LiveLocation, OrderStatusType } from "@ordersync/types";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const router = useRouter();
  const t = useTranslations("orderDetail");

  const { user } = useAuth();
  const driverUid = user?.uid ?? "";

  const { data: marketplaceOrders } = useFetchMarketplaceOrdersQuery(
    driverUid,
    {
      skip: !driverUid,
    },
  );
  const { data: myOrders } = useFetchMyOrdersQuery(driverUid, {
    skip: !driverUid,
  });

  const allOrders = [...(marketplaceOrders ?? []), ...(myOrders ?? [])];
  const order = allOrders.find((o) => o.id === orderId);

  const { claim, start, startRoute, complete, release, isLoading } =
    useOrderActions();
  const { isBlocked } = useDriverFinance();

  const [driverLocation, setDriverLocation] = useState<LiveLocation | null>(
    null,
  );
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [confirmReturnOpen, setConfirmReturnOpen] = useState(false);

  const handleClaim = useCallback(async () => {
    if (!order || !driverUid) return;
    try {
      await claim(order.id, driverUid);
      router.push("/orders/active");
    } catch {
      alert(t("failedToClaim"));
    }
  }, [order, driverUid, claim, router, t]);

  const handleStartDelivery = useCallback(async () => {
    if (!order || !driverUid) return;
    try {
      await start(order.id, driverUid);
    } catch {
      alert(t("failedToStartDelivery"));
    }
  }, [order, driverUid, start, t]);

  const handleStartRoute = useCallback(async () => {
    if (!order || !driverUid) return;
    try {
      await startRoute(order.id, driverUid);
    } catch {
      alert(t("failedToStartRoute"));
    }
  }, [order, driverUid, startRoute, t]);

  const handleCompleteDelivery = useCallback(async () => {
    if (!order || !driverUid) return;
    try {
      await complete(order.id, driverUid);
      router.push("/orders/active");
    } catch {
      alert(t("failedToComplete"));
    }
  }, [order, driverUid, complete, router, t]);

  const handleRelease = useCallback(async () => {
    if (!order || !driverUid) return;
    try {
      await release(order.id, driverUid);
      router.push("/orders");
    } catch {
      alert(t("failedToReturn"));
    }
  }, [order, driverUid, release, router, t]);

  const handleOpenMaps = useCallback(() => {
    const loc = order?.delivery?.latlng;
    if (loc && loc[0] && loc[1]) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${loc[0]},${loc[1]}`,
        "_blank",
      );
    }
  }, [order?.delivery?.latlng]);

  useEffect(() => {
    if (!driverUid) return;

    const driverRef = doc(db, "drivers", driverUid);
    const unsubscribe = onSnapshot(driverRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.liveLocation) {
          setDriverLocation(data.liveLocation as LiveLocation);
        }
      }
    });

    return () => unsubscribe();
  }, [driverUid]);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="animate-spin">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
        <p className="text-sm text-muted-foreground">{t("loadingOrder")}</p>
      </div>
    );
  }

  const orderLocation = order.delivery?.latlng;
  const hasOrderLocation =
    orderLocation && orderLocation[0] && orderLocation[1];
  const hasDriverLocation =
    driverLocation && driverLocation.lat && driverLocation.lng;

  const currentStatus = order.status?.current as OrderStatusType;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Scrollable Content */}
      <main className="flex-1 pb-44">
        {/* Map Section */}
        <div className="relative z-0 px-4">
          {hasOrderLocation ? (
            <div className="relative w-full shadow-lg">
              <OrderMap
                orderLocation={orderLocation}
                driverLocation={hasDriverLocation ? driverLocation : undefined}
                restaurantLocation={order.business?.latlng}
              />
              <button
                onClick={handleOpenMaps}
                className="absolute right-0 top-3 z-1000 flex h-10 items-center gap-2 rounded-xl bg-background px-3 py-2 text-sm font-medium shadow-lg transition-all hover:bg-muted active:scale-[0.96]"
              >
                <Navigation className="h-4 w-4" />
                {t("navigate")}
              </button>
              <button
                onClick={() => router.back()}
                className="absolute inset-s-0 top-3 z-1000 flex h-10 w-10 items-center justify-center rounded-xl bg-background shadow-lg transition-all hover:bg-muted active:scale-[0.95]"
                aria-label={t("goBack")}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex h-50 w-full items-center justify-center rounded-2xl bg-muted/30 ring-1 ring-foreground/5">
              <div className="text-center">
                <MapPin className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("noDeliveryLocation")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Customer Card */}
        <div className="relative z-20 px-4 -mt-10">
          <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("customer")}
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/60">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {order.customer?.name}
                </span>
              </div>
              <a
                href={`tel:${order.customer?.phone}`}
                className="flex items-center gap-3 group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-primary">
                  {order.customer?.phone}
                </span>
                <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-primary/40 group-hover:text-primary/70 transition-colors" />
              </a>
              {order.delivery?.address && (
                <button
                  onClick={handleOpenMaps}
                  className="flex items-start gap-3 text-left group w-full cursor-pointer"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-primary leading-relaxed">
                    {order.delivery.address}
                  </span>
                  <ExternalLink className="ml-auto mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/40 group-hover:text-primary/70 transition-colors" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Items Card */}
        <div className="px-4 pt-3">
          <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("items")}
            </h2>
            <div className="flex flex-col gap-1">
              {order.cart?.map(
                (
                  item: {
                    id: string;
                    name?: string;
                    quantity: number;
                    selectedSize?: string;
                  },
                  index: number,
                ) => (
                  <div
                    key={`${item.id}-${index}`}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2.5",
                      index % 2 === 0 ? "bg-muted/30" : "bg-transparent",
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-semibold text-primary">
                        {item.quantity}x
                      </span>
                      <span className="text-sm font-medium text-foreground truncate">
                        {item.name || item.id}
                      </span>
                      {item.selectedSize && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {item.selectedSize}
                        </span>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/40 px-3 py-3">
              <span className="text-sm font-semibold text-foreground">
                {t("total")}
              </span>
              <span className="text-base font-bold tabular-nums text-foreground">
                {formatPrice(order.pricing?.total ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {order.notes?.order && (
          <div className="px-4 pt-3">
            <button
              onClick={() => setNotesExpanded(!notesExpanded)}
              className="flex w-full items-center justify-between rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/5 transition-colors hover:bg-muted active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                  <span className="text-base">📝</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {t("orderNotes")}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  notesExpanded && "rotate-180",
                )}
              />
            </button>
            {notesExpanded && (
              <div className="mt-1 rounded-2xl bg-amber-500/5 p-4 ring-1 ring-amber-500/10">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {order.notes.order}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Timing Info */}
        {order.timeline?.readyAt && (
          <div className="px-4 pt-3">
            <div className="flex items-center gap-2 px-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-xs text-muted-foreground/60">
                {t("ready", { time: formatRelativeTime(order.timeline.readyAt) })}
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Action Bar - above BottomNav (z-50) */}
      <div className="fixed bottom-20 left-0 right-0 z-60">
        <div className="mx-auto flex max-w-lg flex-col gap-2 px-4">
          <div className="rounded-2xl border border-border/50 bg-background p-3 shadow-xl">
            {/* Primary Action */}
            {currentStatus === "READY" && (
              <Button
                size="lg"
                className="h-12 w-full text-sm font-semibold"
                onClick={handleClaim}
                disabled={isLoading || isBlocked}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("claiming2")}
                  </>
                ) : isBlocked ? (
                  t("limitReached")
                ) : (
                  t("claimOrder")
                )}
              </Button>
            )}
            {currentStatus === "RESERVED" && (
              <Button
                size="lg"
                className="h-12 w-full text-sm font-semibold"
                onClick={handleStartDelivery}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("starting")}
                  </>
                ) : (
                  t("startDelivery")
                )}
              </Button>
            )}
            {currentStatus === "PICKED_UP" && (
              <Button
                size="lg"
                className="h-12 w-full text-sm font-semibold"
                onClick={handleStartRoute}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("startingRoute")}
                  </>
                ) : (
                  t("startRoute")
                )}
              </Button>
            )}
            {currentStatus === "ON_ROUTE" && (
              <Button
                size="lg"
                className="h-12 w-full bg-green-600 text-white hover:bg-green-700 text-sm font-semibold"
                onClick={handleCompleteDelivery}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("completing")}
                  </>
                ) : (
                  t("completeDelivery")
                )}
              </Button>
            )}

            {/* Secondary Actions */}
            {(currentStatus === "RESERVED" ||
              currentStatus === "PICKED_UP" ||
              currentStatus === "ON_ROUTE") && (
              <div className="flex gap-2">
                <a href={`tel:${order.customer?.phone}`} className="flex-1">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-10 w-full gap-1.5 text-sm"
                    disabled={isLoading}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {t("call")}
                  </Button>
                </a>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-10 flex-1 text-sm"
                  onClick={() => setConfirmReturnOpen(true)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {t("returning")}
                    </>
                  ) : (
                    <>
                      <Undo2 className="h-3.5 w-3.5" />
                      {t("returnToReady")}
                    </>
                  )}
                </Button>
              </div>
            )}

            <AlertDialog
              open={confirmReturnOpen}
              onOpenChange={setConfirmReturnOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("returnConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("returnConfirmDesc")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isLoading}>
                    {t("cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    variant="default"
                    onClick={handleRelease}
                    disabled={isLoading}
                  >
                    {isLoading ? t("returning") : t("returnToReady")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
