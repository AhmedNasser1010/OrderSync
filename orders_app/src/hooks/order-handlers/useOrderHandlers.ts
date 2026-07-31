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

const DESTRUCTIVE_STATUSES: OrderStatusType[] = ["CANCELED", "REJECTED", "VOIDED"];

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

type OrderHandler = {
  handleChangeStatus: (orderId: string, nextStatus: OrderStatusType, reason?: string) => void;
  deleteOrder: {
    handleDeleteOrder: (orderId: string | null) => void;
    isLoading: boolean;
    error: unknown;
  };
  getPossibleNextStatuses: (orderId: string) => OrderStatusType[];
  getPossiblePreviousStatuses: (orderId: string) => OrderStatusType[];
};

const useOrderHandler = (): OrderHandler => {
  const uid = useAppSelector(userUid);
  const { data: userData } = useFetchUserDataQuery(uid ? uid : skipToken);
  const { data: orders } = useFetchActiveOrdersQuery(userData?.accessToken ?? skipToken);
  const { data: restaurant } = useFetchRestaurantDataQuery(userData?.accessToken ?? skipToken);
  const [setOrderStatus] = useSetOrderStatusMutation();
  const [setCancelOrder, { isLoading: orderCancellationIsLoading, error: orderCancellationError }] =
    useSetCancelOrderMutation();

  const skipAccepted = restaurant?.settings?.skipAccepted ?? false;

  const canReverse = (current: OrderStatusType, next: OrderStatusType): boolean =>
    canReverseTransition(current, next) ||
    (skipAccepted && current === "PREPARING" && next === "RECEIVED");

  const handleChangeStatus = (orderId: string, nextStatus: OrderStatusType, reason?: string) => {
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

    if (DESTRUCTIVE_STATUSES.includes(nextStatus) && !isRestaurantDestructiveStatusAllowed(currentStatus, nextStatus)) {
      console.error(`Invalid transition: ${currentStatus} -> ${nextStatus}`);
      return;
    }

    const isValidForward = canTransition(currentStatus, nextStatus);
    const isValidReverse = canReverse(currentStatus, nextStatus);

    if (!isValidForward && !isValidReverse) {
      console.error(`Invalid transition: ${currentStatus} -> ${nextStatus}`);
      return;
    }

    if (nextStatus === "CANCELED" || nextStatus === "REJECTED") {
      setCancelOrder({ orderId, reason, status: nextStatus });
    } else {
      setOrderStatus({ orderId, updatedStatus: nextStatus })
        .unwrap()
        .then(() => {
          if (nextStatus === "READY") {
            sendMarketplacePush(orderToUpdate.orderNumber).catch(() => {});
          }
        })
        .catch(() => {});
    }
  };

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

  const handleDeleteOrder = (orderId: string | null) => {
    if (!orderId) return;
    setCancelOrder({ orderId });
  };

  return {
    handleChangeStatus,
    deleteOrder: {
      handleDeleteOrder,
      isLoading: orderCancellationIsLoading,
      error: orderCancellationError,
    },
    getPossibleNextStatuses,
    getPossiblePreviousStatuses,
  };
};

export default useOrderHandler;
