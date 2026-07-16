import {
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  SquareArrowDown,
  CookingPot,
  Bike,
  Ban,
  CircleX,
  Package,
  Truck,
  Star,
  PackageCheck,
} from "lucide-react";
import type { OrderStatusType } from "@ordersync/types";

const getStatusIcon = (status: OrderStatusType) => {
  switch (status) {
    case "RECEIVED":
      return <SquareArrowDown className="h-4 w-4" />;
    case "ACCEPTED":
      return <CheckCircle className="h-4 w-4" />;
    case "PREPARING":
      return <CookingPot className="h-4 w-4" />;
    case "READY":
      return <Package className="h-4 w-4" />;
    case "RESERVED":
      return <Bike className="h-4 w-4" />;
    case "PICKED_UP":
      return <PackageCheck className="h-4 w-4" />;
    case "ON_ROUTE":
      return <Truck className="h-4 w-4" />;
    case "DELIVERED":
      return <CheckCircle className="h-4 w-4" />;
    case "GIVEN_FEEDBACK":
      return <Star className="h-4 w-4" />;
    case "REJECTED":
      return <Ban className="h-4 w-4" />;
    case "CANCELED":
      return <CircleX className="h-4 w-4" />;
    case "VOIDED":
      return <CircleX className="h-4 w-4" />;
    default:
      return null;
  }
};

const getStatusVariant = (status: OrderStatusType) => {
  switch (status) {
    case "RECEIVED":
      return "default";
    case "PREPARING":
    case "ACCEPTED":
      return "secondary";
    case "REJECTED":
    case "CANCELED":
    case "VOIDED":
      return "destructive";
    default:
      return "success";
  }
};

export default function OrderHeader({ id, orderNumber, status }: { id: string; orderNumber: number; status: OrderStatusType }) {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        Order #{orderNumber}
      </CardTitle>
      <Badge
        variant={getStatusVariant(status)}
        className="flex items-center"
      >
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">
          {status.toLowerCase().replace("_", " ")}
        </span>
      </Badge>
    </CardHeader>
  );
}
