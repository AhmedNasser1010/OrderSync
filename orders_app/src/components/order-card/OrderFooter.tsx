import type { OrderStatusType, BusinessDocument } from "@ordersync/types";
import type { MainTabTypes } from "@/types/orders";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFetchRestaurantDataQuery } from "@/rtk/api/firestoreApi";
import { accessToken } from "@/rtk/slices/constantsSlice";
import { useAppSelector } from "@/rtk/hooks";
import { skipToken } from "@reduxjs/toolkit/query";
import ControlMenu from "./ControlMenu";
import useOrderHandler from "@/hooks/order-handlers/useOrderHandlers";
import { isFinalStatus } from "@ordersync/order-utils";
import {
  CheckCircle,
  CookingPot,
  Package,
  Bike,
  PackageCheck,
  Truck,
} from "lucide-react";

const FORWARD_ICONS: Record<string, React.ElementType> = {
  ACCEPTED: CheckCircle,
  PREPARING: CookingPot,
  READY: Package,
  RESERVED: Bike,
  PICKED_UP: PackageCheck,
  ON_ROUTE: Truck,
  DELIVERED: CheckCircle,
};

const FORWARD_LABELS: Record<string, string> = {
  ACCEPTED: "Accept",
  PREPARING: "Prepare",
  READY: "Ready",
  RESERVED: "Picked Up",
  PICKED_UP: "Start Route",
  ON_ROUTE: "Delivered",
};

const DESTRUCTIVE_STATUSES: OrderStatusType[] = ["CANCELED", "REJECTED", "VOIDED"];

function categorizeStatuses(statuses: OrderStatusType[]) {
  const forward: OrderStatusType[] = [];
  const destructive: OrderStatusType[] = [];

  for (const s of statuses) {
    if (DESTRUCTIVE_STATUSES.includes(s)) {
      destructive.push(s);
    } else {
      forward.push(s);
    }
  }

  return { forward, destructive };
}

type Props = {
  id: string;
  activeTabValue: MainTabTypes;
  status: OrderStatusType;
};

export default function OrderFooter({ id, activeTabValue, status }: Props) {
  const resAccessToken = useAppSelector(accessToken);
  const { data: restaurant } = useFetchRestaurantDataQuery(resAccessToken ?? skipToken, { skip: !resAccessToken });
  const printInvoice = restaurant?.settings?.printInvoice ?? false;
  const { handleChangeStatus, getPossibleNextStatuses, getPossiblePreviousStatuses } = useOrderHandler();

  const possibleStatuses = getPossibleNextStatuses(id);
  const previousStatuses = getPossiblePreviousStatuses(id);
  const { forward, destructive } = categorizeStatuses(possibleStatuses);

  const isTerminal = isFinalStatus(status);
  const isReady = status === "READY";

  const primaryForward = forward[0];
  const secondaryForward = forward[1];
  const overflowForward = forward.slice(2);

  const PrimaryIcon = primaryForward ? FORWARD_ICONS[primaryForward] : null;
  const primaryLabel = primaryForward ? FORWARD_LABELS[primaryForward] : null;

  const showPrintInvoice = printInvoice && activeTabValue !== "RECEIVED";

  return (
    <CardFooter className="flex items-center justify-between gap-2 px-4 pb-3 pt-1">
      <div className="flex items-center gap-1">
        {isReady ? (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            <span className="text-sm font-medium">Ready</span>
            <span className="text-xs text-muted-foreground">Waiting for driver</span>
          </div>
        ) : (
          primaryForward &&
          PrimaryIcon && (
            <Button
              size="default"
              variant={status === "ON_ROUTE" ? "success" : "default"}
              className="h-9"
              onClick={(e) => {
                e.stopPropagation();
                handleChangeStatus(id, primaryForward);
              }}
            >
              <PrimaryIcon className="mr-1.5 h-4 w-4" />
              {primaryLabel}
            </Button>
          )
        )}

        {secondaryForward && (
          <Button
            size="default"
            variant="outline"
            className="h-9"
            onClick={(e) => {
              e.stopPropagation();
              handleChangeStatus(id, secondaryForward);
            }}
          >
            {FORWARD_LABELS[secondaryForward] ?? secondaryForward.replace("_", " ")}
          </Button>
        )}
      </div>

      {!isTerminal && (
        <ControlMenu
          orderId={id}
          activeTabValue={activeTabValue}
          overflowStatuses={overflowForward}
          previousStatuses={previousStatuses}
          destructiveStatuses={destructive}
          onStatusChange={(nextStatus) => handleChangeStatus(id, nextStatus)}
          showPrintInvoice={showPrintInvoice}
          restaurant={restaurant as BusinessDocument | undefined}
        />
      )}
    </CardFooter>
  );
}
