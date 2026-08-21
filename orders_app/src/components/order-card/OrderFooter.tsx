"use client";

import { useTranslations } from "next-intl";
import type { OrderStatusType, BusinessDocument } from "@ordersync/types";
import type { MainTabTypes } from "@/types/orders";
import { CardFooter } from "@/components/ui/card";
import { ButtonGuard } from "@/components/ui/button-guard";
import { useFetchRestaurantDataQuery, useFetchUserDataQuery } from "@/rtk/api/firestoreApi";
import { userUid } from "@/rtk/slices/constantsSlice";
import { useAppSelector } from "@/rtk/hooks";
import { skipToken } from "@reduxjs/toolkit/query";
import ControlMenu from "./ControlMenu";
import useOrderHandler from "@/hooks/order-handlers/useOrderHandlers";
import { isFinalStatus } from "@ordersync/order-utils";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  CookingPot,
  Package,
  Bike,
  PackageCheck,
  Truck,
  Play,
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

const FORWARD_LABEL_KEYS: Record<string, string> = {
  ACCEPTED: "accept",
  PREPARING: "prepare",
  READY: "ready",
  RESERVED: "pickedUp",
  PICKED_UP: "startRoute",
  ON_ROUTE: "delivered",
};

const DESTRUCTIVE_STATUSES: OrderStatusType[] = ["CANCELED", "REJECTED"];

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
  returnedByDriver?: boolean;
};

export default function OrderFooter({ id, activeTabValue, status, returnedByDriver }: Props) {
  const ft = useTranslations("Orders.footer");
  const st = useTranslations("Orders.statuses");
  const uid = useAppSelector(userUid);
  const { data: userData } = useFetchUserDataQuery(uid ? uid : skipToken);
  const { data: restaurant } = useFetchRestaurantDataQuery(userData?.accessToken ?? skipToken, {
    skip: !userData?.accessToken,
  });
  const printInvoice = restaurant?.settings?.printInvoice ?? false;
  const { handleChangeStatus, isUpdating, getPossibleNextStatuses, getPossiblePreviousStatuses } = useOrderHandler();

  const possibleStatuses = getPossibleNextStatuses(id);
  const previousStatuses = getPossiblePreviousStatuses(id);
  const { forward, destructive } = categorizeStatuses(possibleStatuses);

  const isTerminal = isFinalStatus(status);
  const isReady = status === "READY";

  const primaryForward = forward[0];
  const secondaryForward = forward[1];
  const overflowForward = forward.slice(2);

  const PrimaryIcon = primaryForward ? FORWARD_ICONS[primaryForward] : null;
  const primaryLabelKey = primaryForward ? FORWARD_LABEL_KEYS[primaryForward] : null;
  const primaryLabel = primaryLabelKey ? ft(primaryLabelKey) : null;

  const showPrintInvoice = printInvoice && activeTabValue !== "RECEIVED";

  const isReceived = status === "RECEIVED";

  return (
    <CardFooter className="flex items-center justify-between gap-2 px-4 pb-3 pt-1">
      <div className="flex items-center gap-1">
        {isReady ? (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                  returnedByDriver ? "bg-amber-400" : "bg-green-400",
                )}
              />
              <span
                className={cn(
                  "relative inline-flex h-2.5 w-2.5 rounded-full",
                  returnedByDriver ? "bg-amber-500" : "bg-green-500",
                )}
              />
            </span>
            {returnedByDriver ? (
              <>
                <span className="text-sm font-medium">{ft("returnedByDriver")}</span>
                <span className="text-xs text-muted-foreground">{ft("awaitingReassignment")}</span>
              </>
            ) : (
              <>
                <span className="text-sm font-medium">{ft("ready")}</span>
                <span className="text-xs text-muted-foreground">{ft("waitingForDriver")}</span>
              </>
            )}
          </div>
        ) : isReceived ? (
          <>
            <ButtonGuard
              size="default"
              variant="default"
              className="h-9"
              disabled={isUpdating}
              busyLabel=""
              cooldown={0}
              onClick={(e) => {
                e.stopPropagation();
                handleChangeStatus(id, "PREPARING");
              }}
            >
              <Play className="mr-1.5 h-4 w-4" />
              {ft("start")}
            </ButtonGuard>
            {primaryForward && primaryForward !== "PREPARING" && (
              <ButtonGuard
                size="default"
                variant="outline"
                className="h-9"
                disabled={isUpdating}
                busyLabel=""
                cooldown={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleChangeStatus(id, primaryForward);
                }}
              >
                {primaryLabel}
              </ButtonGuard>
            )}
          </>
        ) : (
          primaryForward &&
          PrimaryIcon && (
            <ButtonGuard
              size="default"
              variant={status === "ON_ROUTE" ? "success" : "default"}
              className="h-9"
              disabled={isUpdating}
              busyLabel=""
              cooldown={0}
              onClick={(e) => {
                e.stopPropagation();
                handleChangeStatus(id, primaryForward);
              }}
            >
              <PrimaryIcon className="mr-1.5 h-4 w-4" />
              {primaryLabel}
            </ButtonGuard>
          )
        )}

        {!isReceived && secondaryForward && (
          <ButtonGuard
            size="default"
            variant="outline"
            className="h-9"
            disabled={isUpdating}
            busyLabel=""
            cooldown={0}
            onClick={(e) => {
              e.stopPropagation();
              handleChangeStatus(id, secondaryForward);
            }}
          >
            {FORWARD_LABEL_KEYS[secondaryForward] ? ft(FORWARD_LABEL_KEYS[secondaryForward]) : st(secondaryForward)}
          </ButtonGuard>
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
          isUpdating={isUpdating}
        />
      )}
    </CardFooter>
  );
}
