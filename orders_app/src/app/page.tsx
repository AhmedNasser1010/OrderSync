"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeToggle from "./ThemeToggle";
import OrderCard from "./OrderCard";
import UserStatusIndicator from "./UserStatusIndicator";
import SettingsMenu from "./SettingsMenu";
import Page from "@/components/Page";
import useOrders from "@/hooks/useOrders";
import { OrderStatus } from "@/types/order";
import { Package, Truck, CheckCircle } from "lucide-react";

type UserStatus = "active" | "inactive" | "busy";

export default function Orders() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("RECEIVED");
  const [userStatus, setUserStatus] = useState<UserStatus>("active");
  const { formattedOrders } = useOrders();

  const filteredOrders =
    formattedOrders?.filter((order) => order.status === activeTab) || [];

  const closeDay = () => {
    console.log("Closing the day...");
    // Implement day closing logic here
  };

  const generateReport = () => {
    console.log("Generating report...");
    // Implement report generation logic here
  };

  const toggleUserStatus = () => {
    const statusOrder: UserStatus[] = ["active", "inactive", "busy"];
    const currentIndex = statusOrder.indexOf(userStatus);
    const newIndex = (currentIndex + 1) % statusOrder.length;
    setUserStatus(statusOrder[newIndex]);
  };

  if (!formattedOrders?.length) {
    return <h3>Loading...</h3>;
  }

  return (
    <Page>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Orders</h1>
        </div>
        <div className="flex items-center space-x-2">
          <UserStatusIndicator
            userStatus={userStatus}
            toggleUserStatus={toggleUserStatus}
          />
          <SettingsMenu closeDay={closeDay} generateReport={generateReport} />
          <ThemeToggle />
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as OrderStatus)}
      >
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger
            value="RECEIVED"
            className="data-[state=active]:bg-white"
          >
            <Package className="w-4 h-4 mr-2" />
            Received
          </TabsTrigger>
          <TabsTrigger
            value="ON_GOING"
            className="data-[state=active]:bg-white"
          >
            <Truck className="w-4 h-4 mr-2" />
            Ongoing
          </TabsTrigger>
          <TabsTrigger
            value="COMPLETED"
            className="data-[state=active]:bg-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Done
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders?.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Page>
  );
}
