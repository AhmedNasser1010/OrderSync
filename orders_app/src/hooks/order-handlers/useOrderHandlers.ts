import {
  useSetOrderStatusMutation,
  useFetchOpenOrdersDataQuery,
  useFetchUserDataQuery,
  useSetDeleteOrderStatusMutation,
  useFetchRestaurantDataQuery
} from '@/rtk/api/firestoreApi'
import { userUid } from "@/rtk/slices/constantsSlice";
import { useAppSelector } from "@/rtk/hooks";
import { OrderType } from "@/types/order";
import { skipToken } from '@reduxjs/toolkit/query';

type OrderHandler = {
  handleChangeStatus: (orderId: string, direction: "forward" | "backward") => void;
  deleteOrder: {
    handleDeleteOrder: (orderId: string | null, cancellationReason: string | null) => void;
    isLoading: boolean;
    error: any;
  }
  handleAcceptOrder: () => void;
  handleRejectOrder: () => void;
}

const useOrderHandler = (): OrderHandler => {
  const uid = useAppSelector(userUid);
  const { data: userData } = useFetchUserDataQuery(uid ?? skipToken);
  const { data: orders } = useFetchOpenOrdersDataQuery(userData?.accessToken ?? skipToken);
  const { data: restaurant } = useFetchRestaurantDataQuery(userData?.accessToken ?? skipToken);
  const [setOrderStatus] = useSetOrderStatusMutation();
  const [setOrderCancellation, { isLoading: orderCancellationIsLoading, error: orderCancellationError }] = useSetDeleteOrderStatusMutation();

  const handleChangeStatus = (orderId: string, direction: "forward" | "backward") => {
    if (orders?.length && orderId && direction && userData?.accessToken) {
      let statusForward;
      let statusBackward;

      if (restaurant?.settings?.orderManagement?.driverAssignment) {
        statusForward = {
          RECEIVED: "PREPARING",
          PREPARING: "PICK_UP",
          PICK_UP: "DELIVERED",
          ON_ROUTE: "DELIVERED",
        };
        statusBackward = {
          PREPARING: "RECEIVED",
          PICK_UP: "PREPARING",
          ON_ROUTE: "PREPARING",
        };
      } else {
        statusForward = {
          RECEIVED: "PREPARING",
          PREPARING: "ON_ROUTE",
          ON_ROUTE: "DELIVERED",
        };
  
        statusBackward = {
          PREPARING: "RECEIVED",
          ON_ROUTE: "PREPARING",
        };
      }

      const orderToUpdate = orders.find(
        (order: OrderType) => order.id === orderId
      );
      if (!orderToUpdate) {
        console.error(`Cannot find order with id "${orderId}"`);
        return
      }

      const updatedStatus =
        direction === "forward"
          ? statusForward[
              orderToUpdate.status.current as keyof typeof statusForward
            ]
          : statusBackward[
              orderToUpdate.status.current as keyof typeof statusBackward
            ];

      setOrderStatus({ orderToUpdate, orderId, resId: userData?.accessToken, updatedStatus })
    }
  };

  const handleDeleteOrder = (orderId: string | null, cancellationReason: string | null) => {
    if (!orderId) {
      console.log('Order Id Not Found')
      return
    }
    setOrderCancellation({
      orders,
      orderId,
      resId: userData?.accessToken,
      cancellationReason
    })
  };

  const handleAcceptOrder = () => {};

  const handleRejectOrder = () => {};

  return {
    handleChangeStatus,
    deleteOrder: {
      handleDeleteOrder,
      isLoading: orderCancellationIsLoading,
      error: orderCancellationError,
    },
    handleAcceptOrder,
    handleRejectOrder,
  };
};

export default useOrderHandler;
