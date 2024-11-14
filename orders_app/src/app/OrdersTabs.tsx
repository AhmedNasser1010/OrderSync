"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SquareArrowDown, Bike, CookingPot } from "lucide-react";
import { OrderStatusType } from "@/types/order";
import { useAppSelector, useAppDispatch } from "@/rtk/hooks";
import { activeTab, setActiveTab } from "@/rtk/slices/toggleSlice";

export default function OrdersTabs() {
  const dispatch = useAppDispatch();
  const activeTabValue = useAppSelector(activeTab);

  const handleTabChange = (tab: OrderStatusType) => {
    dispatch(setActiveTab(tab));
  };

  return (
    <Tabs
      value={activeTabValue}
      onValueChange={(value) => handleTabChange(value as OrderStatusType)}
    >
      <TabsList className="grid w-full grid-cols-3 mb-4">
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
    </Tabs>
  );
}
