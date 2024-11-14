import PrintInvoice from "./PrintInvoice";
import ControlMenu from "./ControlMenu";
import AssignOrder from "../assign-order-dialog/AssignOrder";
import { OrderStatusType } from "@/types/order";
import { MainTabTypes } from "@/types/components";
import { CardFooter } from "@/components/ui/card";

type Props = {
  id: string;
  activeTabValue: MainTabTypes;
  status: OrderStatusType;
};

export default function OrderFooter({ id, activeTabValue, status }: Props) {
  return (
    <CardFooter className="flex justify-between">
      <div className="flex space-x-1">
        <PrintInvoice activeTabValue={activeTabValue} />
        {activeTabValue === "DELIVERY" && <AssignOrder orderId={id} />}
      </div>
      <ControlMenu id={id} activeTabValue={activeTabValue} status={status} />
    </CardFooter>
  );
}
