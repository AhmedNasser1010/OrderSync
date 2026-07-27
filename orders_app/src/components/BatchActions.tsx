"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useSetOrderStatusMutation } from "@/rtk/api/firestoreApi";
import type { OrderType } from "@ordersync/types";
import { CheckCheck, Loader2 } from "lucide-react";

type Props = {
  receivedOrders: OrderType[];
};

export default function BatchActions({ receivedOrders }: Props) {
  const t = useTranslations("Orders.view");
  const [setOrderStatus, { isLoading }] = useSetOrderStatusMutation();
  const count = receivedOrders.length;

  if (count === 0) return null;

  const handleAcceptAll = async () => {
    await Promise.all(
      receivedOrders.map((order) =>
        setOrderStatus({ orderId: order.id, updatedStatus: "PREPARING" })
      )
    );
  };

  return (
    <Button
      variant="outline"
      className="w-full border-dashed border-primary/40 text-primary hover:bg-primary/5"
      onClick={handleAcceptAll}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CheckCheck className="mr-2 h-4 w-4" />
      )}
      {t("acceptAll", { count })}
    </Button>
  );
}
