"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, CheckCircle } from "lucide-react";
import { OrderStatus } from "@/types/order";
import { useAppSelector, useAppDispatch } from "@/lib/rtk/hooks";
import { activeTab, setActiveTab } from "@/lib/rtk/slices/toggleSlice";

export default function OrdersTabs() {
  const dispatch = useAppDispatch();
  const activeTabValue = useAppSelector(activeTab);

  const handleTabChange = (tab: OrderStatus) => {
    dispatch(setActiveTab(tab));
  };

  return (
    <Tabs
      value={activeTabValue}
      onValueChange={(value) => handleTabChange(value as OrderStatus)}
    >
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="RECEIVED" className="data-[state=active]:bg-white">
          <Package className="w-4 h-4 mr-2" />
          Received
        </TabsTrigger>
        <TabsTrigger value="ON_GOING" className="data-[state=active]:bg-white">
          <Truck className="w-4 h-4 mr-2" />
          Ongoing
        </TabsTrigger>
        <TabsTrigger value="COMPLETED" className="data-[state=active]:bg-white">
          <CheckCircle className="w-4 h-4 mr-2" />
          Done
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
