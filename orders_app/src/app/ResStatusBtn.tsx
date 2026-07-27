"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2 } from "lucide-react";
import useResStatus from "@/hooks/useResStatus";
import type { RestaurantStatusTypes } from "@ordersync/types";
import { cn } from "@/lib/utils";

const statuses: { value: RestaurantStatusTypes; labelKey: string; color: string }[] = [
  { value: "active", labelKey: "active", color: "bg-green-500" },
  { value: "busy", labelKey: "busy", color: "bg-yellow-500" },
  { value: "pause", labelKey: "paused", color: "bg-red-500" },
  { value: "inactive", labelKey: "inactive", color: "bg-gray-500" },
];

function ResStatusBtn() {
  const t = useTranslations("ResStatus");
  const { setResStatus, isLoading, currentStatus } = useResStatus();
  const current = statuses.find((s) => s.value === currentStatus) ?? statuses[3];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <div className={cn("w-2.5 h-2.5 rounded-full mr-2", current.color)} />
          )}
          <span className="capitalize">{t(current.labelKey)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statuses.map((status) => (
          <DropdownMenuItem
            key={status.value}
            onClick={() => setResStatus(status.value)}
            className={cn(
              currentStatus === status.value && "bg-accent text-accent-foreground"
            )}
          >
            <div className={cn("w-2.5 h-2.5 rounded-full mr-2", status.color)} />
            {t(status.labelKey)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ResStatusBtn;
