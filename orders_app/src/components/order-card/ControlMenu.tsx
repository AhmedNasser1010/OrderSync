"use client";

import { useTranslations } from "next-intl";
import type { OrderStatusType, BusinessDocument } from "@ordersync/types";
import type { MainTabTypes } from "@/types/orders";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  MoreVertical,
  Trash2,
  Ban,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGuard } from "@/components/ui/button-guard";
import { useState } from "react";
import { useAppDispatch } from "@/rtk/hooks";
import { setReasonDialog } from "@/rtk/slices/toggleSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Invoice from "../print-invoice-dialog/Invoice";
import useOrders from "@/hooks/useOrders";
import { useReactToPrint } from "react-to-print";
import type { OrderType, ItemType } from "@ordersync/types";
import { useEffect, useRef } from "react";

type Props = {
  orderId: string;
  activeTabValue: MainTabTypes;
  overflowStatuses: OrderStatusType[];
  previousStatuses: OrderStatusType[];
  destructiveStatuses: OrderStatusType[];
  onStatusChange: (status: OrderStatusType) => void;
  showPrintInvoice: boolean;
  restaurant?: BusinessDocument;
  isUpdating?: boolean;
};

export default function ControlMenu({
  orderId,
  activeTabValue,
  overflowStatuses,
  previousStatuses,
  destructiveStatuses,
  onStatusChange,
  showPrintInvoice,
  restaurant,
  isUpdating = false,
}: Props) {
  const ct = useTranslations("Common");
  const ot = useTranslations("Orders.controlMenu");
  const st = useTranslations("Orders.statuses");
  const dispatch = useAppDispatch();
  const [printOpen, setPrintOpen] = useState(false);
  const [order, setOrder] = useState<OrderType | undefined>(undefined);
  const [orderMenu, setOrderMenu] = useState<
    (ItemType & { quantity: number; selectedSize: string; discountCode?: string })[] | undefined
  >(undefined);
  const { getOrder, getOrderMenu, isLoading } = useOrders();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  useEffect(() => {
    if (isLoading === false) {
      setOrder(getOrder(orderId));
    }
  }, [isLoading, getOrder, orderId]);

  useEffect(() => {
    if (isLoading === false && order) {
      const orderMenuData = getOrderMenu(order.cart);
      if (orderMenuData) {
        setOrderMenu(orderMenuData);
      }
    }
  }, [isLoading, order, getOrderMenu]);

  const hasItems =
    overflowStatuses.length > 0 ||
    previousStatuses.length > 0 ||
    destructiveStatuses.length > 0;

  if (!hasItems && !showPrintInvoice) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            disabled={isUpdating}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border border-border">
          {showPrintInvoice && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setPrintOpen(true);
              }}
            >
              <Printer className="ms-2 h-4 w-4" />
              <span>{ct("printInvoice")}</span>
            </DropdownMenuItem>
          )}
          {showPrintInvoice && (overflowStatuses.length > 0 || previousStatuses.length > 0 || destructiveStatuses.length > 0) && (
            <DropdownMenuSeparator />
          )}
          {overflowStatuses.map((nextStatus) => (
            <DropdownMenuItem
              key={nextStatus}
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(nextStatus);
              }}
            >
              <ArrowUpCircle className="ms-2 h-4 w-4" />
              <span>{ot("moveTo", { status: st(nextStatus) })}</span>
            </DropdownMenuItem>
          ))}
          {previousStatuses.length > 0 && (
            <>
              {overflowStatuses.length > 0 && <DropdownMenuSeparator />}
              {previousStatuses.map((prevStatus) => (
                <DropdownMenuItem
                  key={prevStatus}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(prevStatus);
                  }}
                >
                  <ArrowDownCircle className="ms-2 h-4 w-4" />
                  <span>{ot("moveBackTo", { status: st(prevStatus) })}</span>
                </DropdownMenuItem>
              ))}
            </>
          )}
          {destructiveStatuses.length > 0 && (
            <>
              {(overflowStatuses.length > 0 || previousStatuses.length > 0) && (
                <DropdownMenuSeparator />
              )}
              {destructiveStatuses.map((nextStatus) => (
                <DropdownMenuItem
                  key={nextStatus}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(setReasonDialog({ isOpen: true, orderId, status: nextStatus }));
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  {nextStatus === "CANCELED" ? (
                    <Trash2 className="ms-2 h-4 w-4" />
                  ) : (
                    <Ban className="ms-2 h-4 w-4" />
                  )}
                  <span>
                    {nextStatus === "CANCELED"
                      ? ot("cancelOrder")
                      : ot("rejectOrder")}
                  </span>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
            <Printer className="ms-2 h-4 w-4" />
            {ct("printInvoice")}
          </ButtonGuard>
        </DialogContent>
      </Dialog>
    </>
  );
}
