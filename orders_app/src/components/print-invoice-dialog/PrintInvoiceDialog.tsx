"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";
import InvoiceDialogTrigger from "./InvoiceDialogTrigger";
import { MainTabTypes } from "@/types/components";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Invoice from "./Invoice";
import useOrders from "@/hooks/useOrders";
import { useReactToPrint } from "react-to-print";

export default function PrintInvoiceDialog({
  orderId,
  activeTabValue,
  restaurant,
}: {
  orderId: string;
  activeTabValue: MainTabTypes;
  restaurant: any;
}) {
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [orderMenu, setOrderMenu] = useState<any>(null);
  const { getOrder, getOrderMenu, isLoading } = useOrders();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  useEffect(() => {
    if (isLoading === false && order) {
      const orderMenuData = getOrderMenu(order.cart);
      if (orderMenuData) {
        setOrderMenu(orderMenuData);
      }
    }
  }, [isLoading, order, getOrderMenu]);

  useEffect(() => {
    if (isLoading === false) {
      setOrder(getOrder(orderId));
    }
  }, [isLoading, getOrder, orderId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <InvoiceDialogTrigger activeTabValue={activeTabValue} />
      <DialogContent className="disabled-click-1 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Print Invoice</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px] rounded-md border">
          <Invoice
            contentRef={contentRef}
            restaurant={restaurant}
            order={order}
            orderMenu={orderMenu}
          />
        </ScrollArea>
        <Button onClick={reactToPrintFn}>
          <Printer className="mr-2 h-4 w-4" />
          Print Invoice
        </Button>
      </DialogContent>
    </Dialog>
  );
}
