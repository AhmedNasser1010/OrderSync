"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ThemeToggle from './ThemeToggle'
import OrderCard from './OrderCard'
import UserStatusIndicator from './UserStatusIndicator'
import SettingsMenu from './SettingsMenu'

type OrderStatus = "received" | "ongoing" | "done"
type UserStatus = "active" | "inactive" | "busy"

type Order = {
  id: string
  customer: string
  items: string
  total: string
  status: OrderStatus
}

const initialOrders: Order[] = [
  { id: "001", customer: "John Doe", items: "2x Widget A, 1x Widget B", total: "$50.00", status: "received" },
  { id: "002", customer: "Jane Smith", items: "3x Widget C", total: "$75.00", status: "ongoing" },
  { id: "003", customer: "Bob Johnson", items: "1x Widget D, 2x Widget E", total: "$100.00", status: "done" },
  { id: "004", customer: "Alice Brown", items: "4x Widget F", total: "$80.00", status: "received" },
  { id: "005", customer: "Charlie Davis", items: "2x Widget G, 1x Widget H", total: "$65.00", status: "ongoing" },
  { id: "006", customer: "Eva Wilson", items: "3x Widget I", total: "$90.00", status: "done" },
]

export default function Component() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("received")
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [userStatus, setUserStatus] = useState<UserStatus>("active")

  const filteredOrders = orders.filter((order) => order.status === activeTab)

  const changeStatus = (orderId: string, direction: "forward" | "backward") => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const statusOrder: OrderStatus[] = ["received", "ongoing", "done"]
        const currentIndex = statusOrder.indexOf(order.status)
        const newIndex = direction === "forward" 
          ? Math.min(currentIndex + 1, statusOrder.length - 1)
          : Math.max(currentIndex - 1, 0)
        return { ...order, status: statusOrder[newIndex] }
      }
      return order
    }))
  }

  const printInvoice = (orderId: string) => {
    console.log(`Printing invoice for order ${orderId}`)
    // Implement actual printing logic here
  }

  const deleteOrder = (orderId: string) => {
    setOrders(orders.filter(order => order.id !== orderId))
  }

  const closeDay = () => {
    console.log("Closing the day...")
    // Implement day closing logic here
  }

  const generateReport = () => {
    console.log("Generating report...")
    // Implement report generation logic here
  }

  const toggleUserStatus = () => {
    const statusOrder: UserStatus[] = ["active", "inactive", "busy"]
    const currentIndex = statusOrder.indexOf(userStatus)
    const newIndex = (currentIndex + 1) % statusOrder.length
    setUserStatus(statusOrder[newIndex])
  }

  return (
    <div className="container mx-auto p-4 bg-background text-foreground">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Orders</h1>
        </div>
        <div className="flex items-center space-x-2">
          <UserStatusIndicator userStatus={userStatus} toggleUserStatus={toggleUserStatus} />
          <SettingsMenu closeDay={closeDay} generateReport={generateReport} />
          <ThemeToggle />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OrderStatus)}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="received" className="flex items-center justify-center">
            Received
          </TabsTrigger>
          <TabsTrigger value="ongoing" className="flex items-center justify-center">
            Ongoing
          </TabsTrigger>
          <TabsTrigger value="done" className="flex items-center justify-center">
            Done
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                changeStatus={changeStatus}
                printInvoice={printInvoice}
                deleteOrder={deleteOrder}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
