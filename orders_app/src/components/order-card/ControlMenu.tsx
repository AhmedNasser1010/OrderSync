import { OrderStatusType } from "@/types/order";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import useOrderHandler from "@/hooks/order-handlers/useOrderHandlers";
import { useAppDispatch } from "@/rtk/hooks";
import { setDeletePopup } from "@/rtk/slices/toggleSlice";
import { MainTabTypes } from "@/types/components";

type Props = {
  id: string;
  activeTabValue: MainTabTypes;
  status: OrderStatusType;
};

export default function ControlMenu({ id, activeTabValue, status }: Props) {
  const { handleChangeStatus } = useOrderHandler();
  const dispatch = useAppDispatch();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={activeTabValue === "RECEIVED" ? "ml-auto" : undefined}
          variant="ghost"
          size="sm"
          onClick={(e) => e.preventDefault()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="disabled-click-1">
        {status !== "DELIVERED" && (
          <DropdownMenuItem onClick={() => handleChangeStatus(id, "forward")}>
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            <span>Move Forward</span>
          </DropdownMenuItem>
        )}
        {status !== "RECEIVED" && (
          <DropdownMenuItem onClick={() => handleChangeStatus(id, "backward")}>
            <ArrowDownCircle className="mr-2 h-4 w-4" />
            <span>Move Backward</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() =>
            dispatch(setDeletePopup({ orderId: id, isOpen: true }))
          }
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Order</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
