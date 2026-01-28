import ControlMenu from "./ControlMenu";
import AssignOrder from "../assign-order-dialog/AssignOrder";
import { OrderStatusType } from "@/types/order";
import { MainTabTypes } from "@/types/components";
import { CardFooter } from "@/components/ui/card";
import { useFetchRestaurantDataQuery } from "@/rtk/api/firestoreApi";
import { accessToken } from "@/rtk/slices/constantsSlice";
import { useAppSelector } from "@/rtk/hooks";
import PrintInvoiceDialog from "../print-invoice-dialog/PrintInvoiceDialog";

type Props = {
  id: string;
  activeTabValue: MainTabTypes;
  status: OrderStatusType;
};

export default function OrderFooter({ id, activeTabValue, status }: Props) {
  const resAccessToken = useAppSelector(accessToken)
  const { data: restaurant } = useFetchRestaurantDataQuery(resAccessToken);
  const driverAssignment = restaurant?.settings?.orderManagement?.driverAssignment ?? false;
  const printInvoice = restaurant?.settings?.orderManagement?.printInvoice ?? false;

  return (
    <CardFooter className="flex justify-between">
      <div className="flex space-x-1">
        {printInvoice && <PrintInvoiceDialog orderId={id} activeTabValue={activeTabValue} restaurant={restaurant} />}
        {activeTabValue === "DELIVERY" && driverAssignment && <AssignOrder orderId={id} />}
      </div>
      <ControlMenu id={id} activeTabValue={activeTabValue} status={status} />
    </CardFooter>
  );
}
