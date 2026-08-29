"use client";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMemo, useRef, useState } from "react";
import InvoiceDialogTrigger from "./InvoiceDialogTrigger";
import type { MainTabTypes } from "@/types/orders";
import { ButtonGuard } from "@/components/ui/button-guard";
import { Printer } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Invoice from "./Invoice";
import useOrders from "@/hooks/useOrders";
import { useReactToPrint } from "react-to-print";
import type { OrderType, ItemType } from '@ordersync/types';
import type { BusinessDocument } from '@ordersync/types';

export default function PrintInvoiceDialog({
  orderId,
  activeTabValue,
  restaurant,
}: {
  orderId: string;
  activeTabValue: MainTabTypes;
  restaurant: BusinessDocument | undefined;
}) {
  const ct = useTranslations("Common");
  const [open, setOpen] = useState(false);
  const { getOrder, getOrderMenu, isLoading } = useOrders();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const order = useMemo<OrderType | undefined>(() => {
    if (isLoading) return undefined;
    return getOrder(orderId);
  }, [isLoading, getOrder, orderId]);

  const orderMenu = useMemo<
    (ItemType & { quantity: number; selectedSize: string; discountCode?: string })[] | undefined
  >(() => {
    if (isLoading || !order) return undefined;
    return getOrderMenu(order.cart);
  }, [isLoading, order, getOrderMenu]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <InvoiceDialogTrigger activeTabValue={activeTabValue} />
      <DialogContent className="disabled-click-1 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{ct("printInvoice")}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px] rounded-md border border-border">
          <Invoice
            contentRef={contentRef}
            restaurant={restaurant}
            order={order}
            orderMenu={orderMenu}
          />
        </ScrollArea>
        <ButtonGuard onClick={reactToPrintFn} cooldown={1000}>
          <Printer className="mr-2 h-4 w-4" />
          {ct("printInvoice")}
        </ButtonGuard>
      </DialogContent>
    </Dialog>
  );
}
