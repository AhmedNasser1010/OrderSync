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
  Hand
} from "lucide-react";
import { OrderStatusType } from "@/types/order";

const getStatusIcon = (status: OrderStatusType) => {
  switch (status) {
    case "RECEIVED":
      return <SquareArrowDown className="h-4 w-4" />;
    case "PREPARING":
      return <CookingPot className="h-4 w-4" />;
    case "PICK_UP":
      return <Hand className="h-4 w-4" />;
    case "ON_ROUTE":
      return <Bike className="h-4 w-4" />;
    case "DELIVERED":
      return <CheckCircle className="h-4 w-4" />;
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

export default function OrderHeader({ id, status }: { id: string; status: OrderStatusType }) {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        Order #{id.split("-")[0]}
      </CardTitle>
      <Badge
        variant={
          status === "RECEIVED"
            ? "default"
            : status === "PREPARING"
            ? "secondary"
            : status === "REJECTED" || status === "CANCELED"
            ? "destructive"
            : "success"
        }
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
