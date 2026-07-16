import type { OrderStatusType } from "@ordersync/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  MoreVertical,
  Trash2,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  overflowStatuses: OrderStatusType[];
  previousStatuses: OrderStatusType[];
  destructiveStatuses: OrderStatusType[];
  onStatusChange: (status: OrderStatusType) => void;
};

export default function ControlMenu({
  overflowStatuses,
  previousStatuses,
  destructiveStatuses,
  onStatusChange,
}: Props) {
  const hasItems =
    overflowStatuses.length > 0 ||
    previousStatuses.length > 0 ||
    destructiveStatuses.length > 0;

  if (!hasItems) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 disabled-click-1"
          onClick={(e) => e.preventDefault()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="disabled-click-1 border border-border">
        {overflowStatuses.map((nextStatus) => (
          <DropdownMenuItem
            key={nextStatus}
            onClick={() => onStatusChange(nextStatus)}
          >
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            <span>Move to {nextStatus.replace("_", " ")}</span>
          </DropdownMenuItem>
        ))}
        {previousStatuses.length > 0 && (
          <>
            {overflowStatuses.length > 0 && <DropdownMenuSeparator />}
            {previousStatuses.map((prevStatus) => (
              <DropdownMenuItem
                key={prevStatus}
                onClick={() => onStatusChange(prevStatus)}
              >
                <ArrowDownCircle className="mr-2 h-4 w-4" />
                <span>Move back to {prevStatus.replace("_", " ")}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}
        {destructiveStatuses.length > 0 && (
          <>
            {(overflowStatuses.length > 0 || previousStatuses.length > 0) && (
              <DropdownMenuSeparator />
            )}
            {destructiveStatuses.map((nextStatus) => (
              <DropdownMenuItem
                key={nextStatus}
                onClick={() => onStatusChange(nextStatus)}
                className="text-destructive focus:text-destructive"
              >
                {nextStatus === "CANCELED" || nextStatus === "VOIDED" ? (
                  <Trash2 className="mr-2 h-4 w-4" />
                ) : (
                  <Ban className="mr-2 h-4 w-4" />
                )}
                <span>
                  {nextStatus === "CANCELED"
                    ? "Cancel Order"
                    : nextStatus === "REJECTED"
                      ? "Reject Order"
                      : "Void Order"}
                </span>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
