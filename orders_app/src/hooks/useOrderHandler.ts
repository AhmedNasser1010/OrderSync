import {
  useSetOrderStatusMutation,
  useFetchOpenOrdersDataQuery,
  useFetchUserDataQuery,
} from '@/lib/rtk/api/firestoreApi'
import { userUid } from "@/lib/rtk/slices/constantsSlice";
import { useAppSelector } from "@/lib/rtk/hooks";

type OrderHandler = {
  handlePrintInvoice: () => void;
  handleChangeStatus: (orderId: string, direction: "forward" | "backward") => void;
  handleDeleteOrder: () => void;
  handleAcceptOrder: () => void;
  handleRejectOrder: () => void;
}

const useOrderHandler = (): OrderHandler => {
  const uid = useAppSelector(userUid);
  const { data: userData } = useFetchUserDataQuery(uid, { skip: !uid });
  const { data: orders } = useFetchOpenOrdersDataQuery(userData?.accessToken, { skip: !userData?.accessToken });
  const [setOrderStatus] = useSetOrderStatusMutation();

  const handlePrintInvoice = () => {};

  const handleChangeStatus = (orderId: string, direction: "forward" | "backward") => {
    if (orders?.length && orderId && direction && userData?.accessToken) {
      setOrderStatus({ orders, orderId, resId: userData?.accessToken, direction })
    }
  };

  const handleDeleteOrder = () => {};

  const handleAcceptOrder = () => {};

  const handleRejectOrder = () => {};

  return {
    handlePrintInvoice,
    handleChangeStatus,
    handleDeleteOrder,
    handleAcceptOrder,
    handleRejectOrder,
  };
};

export default useOrderHandler;
