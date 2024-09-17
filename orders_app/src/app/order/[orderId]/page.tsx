"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  Printer,
  ExternalLink,
  PhoneOutgoing,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TypographyH3 } from "@/components/ui/typography";
import Link from "next/link";
import Page from "@/components/Page";
import { Order, OrderStatus } from "@/types/order";
import { ItemType } from "@/types/menu";
import useOrders from "@/hooks/useOrders";
import { Beef } from "lucide-react";

const getSizeName: { [key: string]: string } = {
  S: "Small",
  M: "Medium",
  L: "Large",
};

const getSizeIcon: { [key: string]: any } = {
  S: <Beef />,
  M: <Beef />,
  L: <Beef />,
};

export default function OrderDetails({
  params,
}: {
  params: { orderId: string };
}) {
  const router = useRouter();
  const { getOrder, getOrderMenu, isLoading } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderCart, setOrderCart] = useState<ItemType[] | null>(null);

  useEffect(() => {
    if (isLoading === false) {
      setOrder(getOrder(params.orderId) || null);
    }
  }, [isLoading]);

  useEffect(() => {
    if (order && isLoading === false) {
      setOrderCart(getOrderMenu(order.cart));
    }
  }, [order, isLoading]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "RECEIVED":
        return "bg-blue-500";
      case "PREPARING":
        return "bg-yellow-500";
      case "COMPLETED":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const openMap = () => {
    window.open(
      `https://maps.google.com/?q=${order?.location?.latlng[0]},${order?.location?.latlng[0]}`,
      "_blank"
    );
  };

  const openCaller = () => {
    window.open(`tel:${order?.user?.phone}`);
  };

  const printOrder = () => {};

  if (!order) {
    return <h3>Loading...</h3>;
  }
  return (
    <Page>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/" passHref>
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant="outline"
            className={`${getStatusColor(order.status)} text-white`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
          <Badge variant="outline">CASH</Badge>
          <Button variant="outline" size="sm" onClick={printOrder}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>
      <TypographyH3 className="mb-4">
        Order #{order.id.split("-")[0]}
      </TypographyH3>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{order.location.address}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openMap}
                  className="w-[105px]"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Map
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  <span>{order.user.phone}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openCaller}
                  className="w-[105px]"
                >
                  <PhoneOutgoing className="mr-2 h-4 w-4" />
                  Call
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Placed on:</span>
                <span>{order.placedOn}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Accepted on:</span>
                <span>{order.acceptedOn}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fulfillment:</span>
                <span>{order.fulfillmentOn}</span>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orderCart?.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <img
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
                          {getSizeName[item?.selectedSize]}
                        </Badge>
                      )}
                    </div>
                    <span>
                      {item.quantity} x ${item.price}
                    </span>
                  </div>
                  {/* {item.notes && (
                    <div className="text-sm text-muted-foreground">
                      {item.notes}
                    </div>
                  )}
                  {item.options && (
                    <div className="text-sm mt-1">
                      {Object.entries(item.options).map(([key, value]) => (
                        <span key={key} className="mr-2">
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  )} */}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardContent>
          <div className="flex justify-between items-center py-2">
            <span>No Discount</span>
            <span>${order.cartTotalPrice.discount.toFixed(2)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between items-center py-2 font-bold">
            <span>Total</span>
            <span>${order.cartTotalPrice.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </Page>
  );
}
