"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SquareArrowDown, Bike, CookingPot, CheckCircle, XCircle, MoreVertical } from "lucide-react";
import type { MainTabTypes } from "@/types/orders";
import { useAppSelector, useAppDispatch } from "@/rtk/hooks";
import { activeTab, setActiveTab } from "@/rtk/slices/toggleSlice";
import { cn } from "@/lib/utils";

const moreTabs: { value: MainTabTypes; label: string; icon: React.ElementType }[] = [
  { value: "COMPLETED", label: "Completed", icon: CheckCircle },
  { value: "VOIDED", label: "Voided", icon: XCircle },
];

export default function OrdersTabs() {
  const dispatch = useAppDispatch();
  const activeTabValue = useAppSelector(activeTab);

  const handleTabChange = (tab: MainTabTypes) => {
    dispatch(setActiveTab(tab));
  };

  return (
    <Tabs
      value={activeTabValue}
      onValueChange={(value) => handleTabChange(value as MainTabTypes)}
    >
      <div className="flex items-center gap-1 mb-4">
        <TabsList className="flex-1 grid grid-cols-3">
          <TabsTrigger value="RECEIVED">
            <SquareArrowDown className="w-4 h-4 mr-2" />
            Received
          </TabsTrigger>
          <TabsTrigger value="PREPARING">
            <CookingPot className="w-4 h-4 mr-2" />
            Preparing
          </TabsTrigger>
          <TabsTrigger value="DELIVERY">
            <Bike className="w-4 h-4 mr-2" />
            Delivery
          </TabsTrigger>
        </TabsList>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                moreTabs.some((t) => t.value === activeTabValue) && "bg-accent text-accent-foreground"
              )}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {moreTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <DropdownMenuItem
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  className={cn(
                    activeTabValue === tab.value && "bg-accent text-accent-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Tabs>
  );
}
