"use client";

import { use, useMemo, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Phone,
  Printer,
  ExternalLink,
  PhoneOutgoing,
  Clock,
  User,
  ShoppingBag,
  CreditCard,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGuard } from "@/components/ui/button-guard";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import type { OrderType, OrderStatusType } from "@ordersync/types";
import type { ItemType, BusinessDocument } from "@ordersync/types";
import { getOrderRestaurantNet } from "@ordersync/order-utils";
import type { CartItemType } from "@/types/orders";
import useOrders from "@/hooks/useOrders";
import Image from "next/image";
import { useAppSelector } from "@/rtk/hooks";
import { userUid } from "@/rtk/slices/constantsSlice";
import {
  useFetchRestaurantDataQuery,
  useFetchUserDataQuery,
} from "@/rtk/api/firestoreApi";
import Invoice from "@/components/print-invoice-dialog/Invoice";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useReactToPrint } from "react-to-print";
import { skipToken } from "@reduxjs/toolkit/query";
import { PRINT_INVOICE_ENABLED } from "@/lib/feature-flags";

const STATUS_CONFIG: Record<OrderStatusType, { color: string; bg: string; dot: string }> = {
  RECEIVED: {
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    dot: "bg-blue-500",
  },
  ACCEPTED: {
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-950/40",
    dot: "bg-yellow-500",
  },
  PREPARING: {
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-950/40",
    dot: "bg-yellow-500",
  },
  READY: {
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    dot: "bg-purple-500",
  },
  RESERVED: {
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    dot: "bg-orange-500",
  },
  PICKED_UP: {
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    dot: "bg-orange-500",
  },
  ON_ROUTE: {
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    dot: "bg-orange-500",
  },
  DELIVERED: {
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/40",
    dot: "bg-green-500",
  },
  GIVEN_FEEDBACK: {
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/40",
    dot: "bg-green-500",
  },
  REJECTED: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40",
    dot: "bg-red-500",
  },
  CANCELED: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40",
    dot: "bg-red-500",
  },
  VOIDED: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40",
    dot: "bg-red-500",
  },
};

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function OrderDetails({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const t = useTranslations("OrderDetails");
  const ct = useTranslations("Common");
  const st = useTranslations("Orders.statuses");
  const locale = useLocale();
  const { orderId } = use(params);
  const { getOrder, getOrderMenu, isLoading } = useOrders();
  const uid = useAppSelector(userUid);
  const { data: userData } = useFetchUserDataQuery(uid ? uid : skipToken);
  const { data: restaurant } = useFetchRestaurantDataQuery(
    userData?.accessToken ?? skipToken,
    {
      skip: !userData?.accessToken,
    }
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const printInvoice = useReactToPrint({ contentRef });

  const order = useMemo<OrderType | null>(() => {
    if (isLoading) return null;
    return getOrder(orderId) ?? null;
  }, [isLoading, getOrder, orderId]);

  const orderCart = useMemo<(ItemType & CartItemType)[] | null>(() => {
    if (!order || isLoading) return null;
    return getOrderMenu(order.cart);
  }, [order, isLoading, getOrderMenu]);

  const openMap = () => {
    if (order?.delivery?.latlng) {
      window.open(
        `https://maps.google.com/?q=${order.delivery.latlng[0]},${order.delivery.latlng[1]}`,
        "_blank"
      );
    }
  };

  const openCaller = () => {
    window.open(`tel:${order?.customer?.phone}`);
  };

  const printOrder = () => {
    printInvoice?.();
  };

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          <p className="text-sm">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status.current] || STATUS_CONFIG.RECEIVED;
  const currency = ct("currency");

  return (
    <div className="pb-32">
      {/* ── Sticky Top Bar ── */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/" passHref>
              <Button variant="ghost" size="sm" className="ltr:-ml-2 rtl:-mr-2 gap-1.5">
                {locale === "ar" ? (
                  <ArrowRight className="h-4 w-4" />
                ) : (
                  <ArrowLeft className="h-4 w-4" />
                )}
                <span className="text-sm">{ct("back")}</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "border-0 font-medium flex items-center gap-1.5",
                  statusConfig.bg,
                  statusConfig.color
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusConfig.dot)} />
                {st(order.status.current)}
              </Badge>
              {PRINT_INVOICE_ENABLED && (
                <ButtonGuard
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={printOrder}
                  disabled={!orderCart || !restaurant}
                  cooldown={1000}
                  showSpinner={false}
                >
                  <Printer className="h-4 w-4" />
                </ButtonGuard>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 pt-5 space-y-5">
        {/* ── Order Header Card ── */}
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {t("title", { number: order.orderNumber })}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(order.timeline.placedAt)} • {formatTime(order.timeline.placedAt)}
                </span>
                {order.payment.method && (
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" />
                    {order.payment.method}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Customer Note (if any) ── */}
        {order.delivery?.note && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex items-start gap-3">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-0.5">
                Customer Note
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {order.delivery.note}
              </p>
            </div>
          </div>
        )}

        {/* ── Customer Info ── */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-5 pt-4 pb-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">{t("customerInfo")}</h2>
          </div>
          <div className="px-5 pb-4 space-y-3">
            {/* Customer Name */}
            {order.customer.name && (
              <p className="text-sm font-medium text-foreground">{order.customer.name}</p>
            )}

            {/* Address */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground break-words">
                  {order.delivery.address || "—"}
                </span>
              </div>
              {order.delivery?.latlng && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openMap}
                  className="shrink-0 h-8 gap-1.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="text-xs">{t("openMap")}</span>
                </Button>
              )}
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {order.customer.phone || "—"}
                </span>
              </div>
              {order.customer.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openCaller}
                  className="shrink-0 h-8 gap-1.5"
                >
                  <PhoneOutgoing className="h-3.5 w-3.5" />
                  <span className="text-xs">{t("call")}</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── Order Items ── */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-5 pt-4 pb-2">
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">{t("orderItems")}</h2>
            <span className="text-xs text-muted-foreground ltr:ml-auto rtl:mr-auto">
              {orderCart?.length || 0} {orderCart?.length === 1 ? "item" : "items"}
            </span>
          </div>
          <div className="px-5 pb-4 divide-y divide-border/50">
            {orderCart?.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 py-3 first:pt-1 last:pb-1"
              >
                {/* Item Image */}
                <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-muted">
                  {item.backgrounds?.[0] && (
                    <Image
                      src={item.backgrounds[0]}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  )}
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.title}
                      </p>
                      {item?.selectedSize && (
                        <Badge
                          variant="secondary"
                          className="mt-1 text-[10px] px-1.5 py-0 h-5 font-normal"
                        >
                          {item.selectedSize === "S"
                            ? t("sizeSmall")
                            : item.selectedSize === "M"
                            ? t("sizeMedium")
                            : t("sizeLarge")}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {/* Price & Quantity */}
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-muted-foreground">
                      {item.quantity} ×{" "}
                      {locale === "ar"
                        ? `${item.price} ${currency}`
                        : `${currency}${item.price}`}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {locale === "ar"
                        ? `${(item.quantity * Number(item.price)).toFixed(2)} ${currency}`
                        : `${currency}${(item.quantity * Number(item.price)).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {(!orderCart || orderCart.length === 0) && (
              <p className="text-sm text-muted-foreground py-3 text-center">
                No items available
              </p>
            )}
          </div>
        </div>

        {/* ── Pricing Summary ── */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span className="text-foreground">
                {locale === "ar"
                  ? `${order.pricing.subtotal.toFixed(2)} ${currency}`
                  : `${currency}${order.pricing.subtotal.toFixed(2)}`}
              </span>
            </div>
            {order.pricing.discount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("discount")}</span>
                <span className="text-green-600 dark:text-green-400">
                  -{locale === "ar"
                    ? `${order.pricing.discount.toFixed(2)} ${currency}`
                    : `${currency}${order.pricing.discount.toFixed(2)}`}
                </span>
              </div>
            )}
            <Separator className="bg-border/50" />
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-foreground">{t("netTotal")}</span>
              <span className="text-lg font-bold text-foreground">
                {locale === "ar"
                  ? `${getOrderRestaurantNet(order).toFixed(2)} ${currency}`
                  : `${currency}${getOrderRestaurantNet(order).toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Hidden Print Content ── */}
      <div className="fixed top-0 left-0 h-0 w-0 overflow-hidden opacity-0 pointer-events-none">
        {order && orderCart && restaurant && (
          <ScrollArea className="h-[500px] rounded-md border border-border">
            <Invoice
              contentRef={contentRef}
              restaurant={restaurant as BusinessDocument}
              order={order}
              orderMenu={orderCart}
            />
          </ScrollArea>
        )}
      </div>
    </div>
  );
}