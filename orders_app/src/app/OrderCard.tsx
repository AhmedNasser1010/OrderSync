import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  CheckCircle,
  SquareArrowDown,
  CookingPot,
  Printer,
  Check,
  X,
  Bike
} from "lucide-react";
import Link from "next/link";
import { Order, OrderStatus, FormattedOrder } from "@/types/order";
import useOrderHandler from "@/hooks/useOrderHandler";
import { useRouter } from "next/navigation";
import { setDeletePopup } from "@/lib/rtk/slices/toggleSlice";
import { useAppDispatch } from "@/lib/rtk/hooks";

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case "RECEIVED":
      return <SquareArrowDown className="h-4 w-4" />;
    case "PREPARING":
      return <CookingPot className="h-4 w-4" />;
    case "DELIVERY":
      return <Bike className="h-4 w-4" />;
    case "COMPLETED":
      return <CheckCircle className="h-4 w-4" />;
  }
};

const OrderCard = ({ order, activeTabValue }: { order: FormattedOrder, activeTabValue: string }) => {
  const {
    handlePrintInvoice,
    handleChangeStatus,
    handleAcceptOrder,
    handleRejectOrder,
  } = useOrderHandler();
  const router = useRouter()
  const dispatch = useAppDispatch()

  const handleNavigate = (e: React.MouseEvent<HTMLDivElement>) => {
    const preventedElement = (e.target as HTMLElement).closest('.disabled-click-1')

    if (!preventedElement) {
      router.push(`/order/${order.id}`)
    }
  }

  return (
      <Card
        className={`cursor-pointer transition-shadow hover:shadow-md ${
          order.accepted ? "" : "bg-green-100 dark:bg-green-900"
        }`}
        onClick={handleNavigate}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Order #{order.id.split("-")[0]}
          </CardTitle>
          <Badge
            variant={
              order.status === "RECEIVED"
                ? "default"
                : order.status === "PREPARING"
                ? "secondary"
                : "success"
            }
            className="flex items-center"
          >
            {getStatusIcon(order.status)}
            <span className="ml-1 capitalize">
              {order.status.toLowerCase().replace("_", " ")}
            </span>
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{order.total}</div>
          <p className="text-xs text-muted-foreground mt-1">{order.customer}</p>
          <p className="text-sm mt-2 line-clamp-2">{order.items}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          {activeTabValue !== "RECEIVED" &&
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintInvoice}
              className="disabled-click-1 flex items-center"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Invoice
            </Button>
          }
          {/* {order.accepted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintInvoice}
              className="disabled-click-1 flex items-center"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Invoice
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onMouseUp={handleAcceptOrder}
                className="flex items-center"
              >
                <Check className="mr-2 h-4 w-4" />
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectOrder}
                className="flex items-center"
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          )} */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={activeTabValue === "RECEIVED" ? 'ml-auto' : undefined}
                variant="ghost"
                size="sm"
                onClick={(e) => e.preventDefault()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className='disabled-click-1'>
              {order.status !== "COMPLETED" && (
                <DropdownMenuItem
                  onClick={(e) => handleChangeStatus(order.id, "forward")}
                >
                  <ArrowUpCircle className="mr-2 h-4 w-4" />
                  <span>Move Forward</span>
                </DropdownMenuItem>
              )}
              {order.status !== "RECEIVED" && (
                <DropdownMenuItem
                  onClick={(e) => handleChangeStatus(order.id, "backward")}
                >
                  <ArrowDownCircle className="mr-2 h-4 w-4" />
                  <span>Move Backward</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => dispatch(setDeletePopup({ orderId: order.id, isOpen: true }))}>
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Order</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>
  );
};

export default OrderCard;
