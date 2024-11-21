import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import DriverDuesDialog from "../set-driver-dues-dialog/DriverDues";

type Props = {
  driverId: string;
  orderDues: number;
};

export default function DriverCardDuesAndActions({
  driverId,
  orderDues,
}: Props) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">${orderDues.toFixed(2)}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="disabled-click-1">
          <DropdownMenuItem asChild>
            <DriverDuesDialog driverId={driverId} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
