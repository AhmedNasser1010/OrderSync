import {
  useSetOrderStatusMutation,
  useFetchActiveOrdersQuery,
  useFetchUserDataQuery,
  useSetCancelOrderMutation,
  useFetchRestaurantDataQuery,
} from "@/rtk/api/firestoreApi";
import { userUid } from "@/rtk/slices/constantsSlice";
import { useAppSelector } from "@/rtk/hooks";
import type { OrderType, OrderStatusType } from "@ordersync/types";
import { skipToken } from "@reduxjs/toolkit/query";
import { canTransition, canReverseTransition, getNextStatuses, getPreviousStatuses, isDriverOwned } from "@ordersync/order-utils";
import { sendMarketplacePush } from "@/app/actions/sendMarketplacePush";
import { useClickGuard } from "@/hooks/useClickGuard";

const DESTRUCTIVE_STATUSES: OrderStatusType[] = ["CANCELED", "REJECTED", "VOIDED"];
const STATUS_CHANGE_COOLDOWN_MS = 800;

const RESTAURANT_DESTRUCTIVE_STATUSES: Record<OrderStatusType, OrderStatusType[]> = {
  RECEIVED: ["REJECTED"],
  ACCEPTED: ["CANCELED"],
  PREPARING: ["CANCELED"],
  READY: [],
  RESERVED: [],
  PICKED_UP: [],
  ON_ROUTE: [],
  DELIVERED: [],
  GIVEN_FEEDBACK: [],
  CANCELED: [],
  REJECTED: [],
  VOIDED: [],
};

const isRestaurantDestructiveStatusAllowed = (
  current: OrderStatusType,
  next: OrderStatusType,
): boolean => RESTAURANT_DESTRUCTIVE_STATUSES[current]?.includes(next) ?? false;

// A READY order may only be canceled directly when a driver returned it
// (normal marketplace READY orders remain non-yankable by the restaurant).
const isReadyCancelAllowed = (order: OrderType): boolean =>
  order.status.current === "READY" && order.status.returnedByDriverUid != null;

type OrderHandler = {
  handleChangeStatus: (orderId: string, nextStatus: OrderStatusType, reason?: string) => void;
  isCanceling: boolean;
  isUpdating: boolean;
  getPossibleNextStatuses: (orderId: string) => OrderStatusType[];
  getPossiblePreviousStatuses: (orderId: string) => OrderStatusType[];
};

const useOrderHandler = (): OrderHandler => {
  const uid = useAppSelector(userUid);
  const { data: userData } = useFetchUserDataQuery(uid ? uid : skipToken);
  const { data: orders } = useFetchActiveOrdersQuery(userData?.accessToken ?? skipToken);
  const { data: restaurant } = useFetchRestaurantDataQuery(userData?.accessToken ?? skipToken);
  const [setOrderStatus] = useSetOrderStatusMutation();
  const [setCancelOrder, { isLoading: orderCancellationIsLoading }] =
    useSetCancelOrderMutation();

  const skipAccepted = restaurant?.settings?.skipAccepted ?? false;

  const canReverse = (current: OrderStatusType, next: OrderStatusType): boolean =>
    canReverseTransition(current, next) ||
    (skipAccepted && current === "PREPARING" && next === "RECEIVED");

  const applyStatusChange = (orderId: string, nextStatus: OrderStatusType, reason?: string) => {
    if (!orders?.length || !orderId) return;

    const orderToUpdate = orders.find((order: OrderType) => order.id === orderId);
    if (!orderToUpdate) {
      console.error(`Cannot find order with id "${orderId}"`);
      return;
    }

    const currentStatus = orderToUpdate.status.current;

    if (isDriverOwned(orderToUpdate)) {
      console.error(`Order ${orderId} is claimed by a driver and cannot be updated from the orders app`);
      return;
    }

    if (nextStatus === "VOIDED") {
      console.error(`Voiding orders is not supported in the orders app`);
      return;
    }

    const destructiveAllowed =
      isRestaurantDestructiveStatusAllowed(currentStatus, nextStatus) ||
      (currentStatus === "READY" && nextStatus === "CANCELED" && isReadyCancelAllowed(orderToUpdate));

    if (DESTRUCTIVE_STATUSES.includes(nextStatus) && !destructiveAllowed) {
      console.error(`Invalid transition: ${currentStatus} -> ${nextStatus}`);
      return;
    }

    const isValidForward = canTransition(currentStatus, nextStatus);
    const isValidReverse = canReverse(currentStatus, nextStatus);

    if (!isValidForward && !isValidReverse) {
      console.error(`Invalid transition: ${currentStatus} -> ${nextStatus}`);
      return;
    }

    // For cancel/reject we use a dedicated mutation that already exposes
    // an isLoading flag; keep it awaited so the guard locks across the call.
    if (nextStatus === "CANCELED" || nextStatus === "REJECTED") {
      return setCancelOrder({ orderId, reason, status: nextStatus }).unwrap();
    }

    return setOrderStatus({ orderId, updatedStatus: nextStatus })
      .unwrap()
      .then(() => {
        if (nextStatus === "READY") {
          sendMarketplacePush(orderToUpdate.orderNumber).catch(() => {});
        }
      })
      .catch(() => {});
  };

  // Wrap the raw transition in an in-flight + cooldown guard so rapid
  // double-clicks can't fire duplicate/conflicting status mutations.
  const { run: handleChangeStatus, busy: isUpdating } = useClickGuard(
    applyStatusChange,
    { cooldown: STATUS_CHANGE_COOLDOWN_MS, resetOnError: true }
  );

  const getPossibleNextStatuses = (orderId: string): OrderStatusType[] => {
    const order = orders?.find((o) => o.id === orderId);
    if (!order) return [];
    if (isDriverOwned(order)) {
      return [];
    }
    const nextStatuses = getNextStatuses(order.status.current);
    return nextStatuses.filter(
      (next) => {
        if (skipAccepted && order.status.current === "RECEIVED" && next === "ACCEPTED") {
          return false;
        }
        if (
          order.status.current === "READY" &&
          next === "CANCELED"
        ) {
          return isReadyCancelAllowed(order);
        }
        return (
          !DESTRUCTIVE_STATUSES.includes(next) ||
          isRestaurantDestructiveStatusAllowed(order.status.current, next)
        );
      },
    );
  };

  const getPossiblePreviousStatuses = (orderId: string): OrderStatusType[] => {
    const order = orders?.find((o) => o.id === orderId);
    if (!order) return [];
    if (isDriverOwned(order)) return [];
    if (skipAccepted && order.status.current === "PREPARING") {
      return getPreviousStatuses(order.status.current)
        .filter((prev) => prev !== "ACCEPTED")
        .concat("RECEIVED");
    }
    return getPreviousStatuses(order.status.current);
  };

  return {
    handleChangeStatus,
    isCanceling: orderCancellationIsLoading,
    isUpdating,
    getPossibleNextStatuses,
    getPossiblePreviousStatuses,
  };
};

export default useOrderHandler;
