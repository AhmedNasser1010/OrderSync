import {
  useSetOrderStatusMutation,
  useFetchOpenOrdersDataQuery,
  useFetchUserDataQuery,
  useSetDeleteOrderStatusMutation
} from '@/lib/rtk/api/firestoreApi'
import { userUid } from "@/lib/rtk/slices/constantsSlice";
import { useAppSelector } from "@/lib/rtk/hooks";

type OrderHandler = {
  handlePrintInvoice: () => void;
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
  const { data: userData } = useFetchUserDataQuery(uid, { skip: !uid });
  const { data: orders } = useFetchOpenOrdersDataQuery(userData?.accessToken, { skip: !userData?.accessToken });
  const [setOrderStatus] = useSetOrderStatusMutation();
  const [setOrderCancellation, { isLoading: orderCancellationIsLoading, error: orderCancellationError }] = useSetDeleteOrderStatusMutation();

  const handlePrintInvoice = () => {};

  const handleChangeStatus = (orderId: string, direction: "forward" | "backward") => {
    if (orders?.length && orderId && direction && userData?.accessToken) {
      setOrderStatus({ orders, orderId, resId: userData?.accessToken, direction })
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
    handlePrintInvoice,
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
