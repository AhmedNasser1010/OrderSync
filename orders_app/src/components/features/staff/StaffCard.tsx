import { User, RotateCcw, Trash2, MoreVertical, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Driver } from "@/types/driver";
import DriverDuesDialog from "@/components/set-driver-dues-dialog/DriverDues";
import { DeleteMemberDialog } from "./DeleteMemberDialog";
import StatusToggle from "./StatusToggle";

export function StaffCard({ member }: { member: Driver }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">
              {member.userInfo.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {member.userInfo.role}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              member.online.byManager
                ? "bg-green-500/20 text-green-500"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {member.online.byManager ? "Active" : "Inactive"}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DeleteMemberDialog member={member}>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Member
                </DropdownMenuItem>
              </DeleteMemberDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Email</span>
          <span className="text-foreground">{member.userInfo.email}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Phone</span>
          <a
            href={`tel:${member.userInfo.phone}`}
            className="text-green-500 flex items-center gap-1.5 hover:underline"
          >
            <Phone className="w-3.5 h-3.5" />
            {member.userInfo.phone}
          </a>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Dues</span>
          <span
            className={`font-medium ${member.ordersDues > 0 ? "text-destructive" : "text-green-500"}`}
          >
            ${member.ordersDues.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="border-t border-border" />

      <div className="flex items-center justify-between">
        <StatusToggle driverId={member.uid} status={member.online.byManager} />

        <DriverDuesDialog driverId={member.uid}>
          <Button variant="secondary" size="sm" className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            Set Dues
          </Button>
        </DriverDuesDialog>
      </div>
    </div>
  );
}
