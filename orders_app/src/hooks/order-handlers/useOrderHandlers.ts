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
import { canTransition, canReverseTransition, getNextStatuses, getPreviousStatuses } from "@ordersync/order-utils";

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

  const handleChangeStatus = (orderId: string, nextStatus: OrderStatusType, reason?: string) => {
    if (!orders?.length || !orderId) return;

    const orderToUpdate = orders.find((order: OrderType) => order.id === orderId);
    if (!orderToUpdate) {
      console.error(`Cannot find order with id "${orderId}"`);
      return;
    }

    const currentStatus = orderToUpdate.status.current;
    const isValidForward = canTransition(currentStatus, nextStatus);
    const isValidReverse = canReverseTransition(currentStatus, nextStatus);

    if (!isValidForward && !isValidReverse) {
      console.error(`Invalid transition: ${currentStatus} -> ${nextStatus}`);
      return;
    }

    if (nextStatus === "CANCELED" || nextStatus === "REJECTED") {
      setCancelOrder({ orderId, reason });
    } else {
      setOrderStatus({ orderId, updatedStatus: nextStatus });
    }
  };

  const getPossibleNextStatuses = (orderId: string): OrderStatusType[] => {
    const order = orders?.find((o) => o.id === orderId);
    if (!order) return [];
    return getNextStatuses(order.status.current);
  };

  const getPossiblePreviousStatuses = (orderId: string): OrderStatusType[] => {
    const order = orders?.find((o) => o.id === orderId);
    if (!order) return [];
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
