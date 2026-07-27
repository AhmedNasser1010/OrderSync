"use client";

import { use, useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Printer,
  ExternalLink,
  PhoneOutgoing,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TypographyH3 } from "@/components/ui/typography";
import { Link } from "@/i18n/routing";
import Page from "@/components/Page";
import type { OrderType, OrderStatusType } from "@ordersync/types";
import type { ItemType, BusinessDocument } from "@ordersync/types";
import type { CartItemType } from "@/types/orders";
import useOrders from "@/hooks/useOrders";
import Image from "next/image";
import { useAppSelector } from "@/rtk/hooks";
import { accessToken } from "@/rtk/slices/constantsSlice";
import { useFetchRestaurantDataQuery } from "@/rtk/api/firestoreApi";
import Invoice from "@/components/print-invoice-dialog/Invoice";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useReactToPrint } from "react-to-print";

const getSizeName: { [key: string]: string } = {
  S: "Small",
  M: "Medium",
  L: "Large",
};

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
  const resAccessToken = useAppSelector(accessToken);
  const { data: restaurant } = useFetchRestaurantDataQuery(resAccessToken ?? "", {
    skip: !resAccessToken,
  });
  const [order, setOrder] = useState<OrderType | null>(null);
  const [orderCart, setOrderCart] = useState<(ItemType & CartItemType)[] | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const printInvoice = useReactToPrint({ contentRef });

  useEffect(() => {
    if (isLoading === false) {
      setOrder(getOrder(orderId) || null);
    }
  }, [isLoading, getOrder, orderId]);

  useEffect(() => {
    if (order && isLoading === false) {
      setOrderCart(getOrderMenu(order.cart));
    }
  }, [order, isLoading, getOrderMenu]);

  const getStatusColor = (status: OrderStatusType) => {
    switch (status) {
      case "RECEIVED":
        return "bg-blue-500";
      case "PREPARING":
      case "ACCEPTED":
        return "bg-yellow-500";
      case "READY":
        return "bg-purple-500";
      case "RESERVED":
      case "PICKED_UP":
      case "ON_ROUTE":
        return "bg-orange-500";
      case "DELIVERED":
      case "GIVEN_FEEDBACK":
        return "bg-green-500";
      case "REJECTED":
      case "CANCELED":
      case "VOIDED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

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
    return <h3>{t("loading")}</h3>;
  }

  return (
    <Page>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/" passHref>
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {ct("back")}
            </Button>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant="outline"
            className={`${getStatusColor(order.status.current)} text-white`}
          >
            {st(order.status.current)}
          </Badge>
          <Badge variant="outline">{order.payment.method}</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={printOrder}
            disabled={!orderCart || !restaurant}
          >
            <Printer className="mr-2 h-4 w-4" />
            {ct("print")}
          </Button>
        </div>
      </div>
      <TypographyH3 className="mb-4">
        {t("title", { number: order.orderNumber })}
      </TypographyH3>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("customerInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{order.delivery.address}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openMap}
                  className="w-[105px]"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t("openMap")}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  <span>{order.customer.phone}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openCaller}
                  className="w-[105px]"
                >
                  <PhoneOutgoing className="mr-2 h-4 w-4" />
                  {t("call")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("orderItems")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orderCart?.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Image
                  src={item.backgrounds[0]}
                  alt={item.title}
                  width={100}
                  height={100}
                  className="rounded-md object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium block">{item.title}</span>
                      {item?.selectedSize && (
                        <Badge variant="outline">
                          {item.selectedSize === "S" ? t("sizeSmall") : item.selectedSize === "M" ? t("sizeMedium") : t("sizeLarge")}
                        </Badge>
                      )}
                    </div>
                    <span>
                      {item.quantity} x {locale === "ar" ? `${item.price} ${ct("currency")}` : `${ct("currency")}${item.price}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardContent>
          <div className="flex justify-between items-center py-2">
            <span>{t("subtotal")}</span>
            <span>{locale === "ar" ? `${order.pricing.subtotal.toFixed(2)} ${ct("currency")}` : `${ct("currency")}${order.pricing.subtotal.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span>{t("discount")}</span>
            <span>{locale === "ar" ? `${order.pricing.discount.toFixed(2)} ${ct("currency")}` : `${ct("currency")}${order.pricing.discount.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span>{t("deliveryFees")}</span>
            <span>{locale === "ar" ? `${order.pricing.deliveryFees.toFixed(2)} ${ct("currency")}` : `${ct("currency")}${order.pricing.deliveryFees.toFixed(2)}`}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between items-center py-2 font-bold">
            <span>{t("total")}</span>
            <span>{locale === "ar" ? `${order.pricing.total.toFixed(2)} ${ct("currency")}` : `${ct("currency")}${order.pricing.total.toFixed(2)}`}</span>
          </div>
        </CardContent>
      </Card>
      <div className="absolute left-[-9999px] top-0 opacity-0 pointer-events-none">
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
    </Page>
  );
}
