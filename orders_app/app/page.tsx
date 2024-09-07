"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Package, Truck, CheckCircle, MoreVertical, ArrowUpCircle, ArrowDownCircle, Printer, Trash2, Settings, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

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

function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

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

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "inactive":
        return "bg-gray-500"
      case "busy":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "received":
        return <Package className="h-4 w-4" />
      case "ongoing":
        return <Truck className="h-4 w-4" />
      case "done":
        return <CheckCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto p-4 bg-background text-foreground">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Order Management</h1>
          <div className="flex items-center space-x-2">
            <div 
              className={`w-3 h-3 rounded-full ${getStatusColor(userStatus)}`} 
              title={`Status: ${userStatus}`}
            />
            <span className="text-sm font-medium capitalize">{userStatus}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={toggleUserStatus}>
            Toggle Status
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Open settings menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="top">
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <Button onClick={closeDay}>Close the Day</Button>
                <Button onClick={generateReport}>Generate Report</Button>
              </div>
            </SheetContent>
          </Sheet>
          <ThemeToggle />
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OrderStatus)}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="received" className="flex items-center justify-center">
            <Package className="w-4 h-4 mr-2" />
            Received
          </TabsTrigger>
          <TabsTrigger value="ongoing" className="flex items-center justify-center">
            <Truck className="w-4 h-4 mr-2" />
            Ongoing
          </TabsTrigger>
          <TabsTrigger value="done" className="flex items-center justify-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Done
          </TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Order #{order.id}
                  </CardTitle>
                  <Badge
                    variant={
                      order.status === "received"
                        ? "default"
                        : order.status === "ongoing"
                        ? "secondary"
                        : "success"
                    }
                    className="flex items-center"
                  >
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{order.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {order.customer}
                  </p>
                  <p className="text-sm mt-2">{order.items}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => printInvoice(order.id)}>
                    Print Invoice
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {order.status !== "done" && (
                        <DropdownMenuItem onClick={() => changeStatus(order.id, "forward")}>
                          <ArrowUpCircle className="mr-2 h-4 w-4" />
                          <span>Move Forward</span>
                        </DropdownMenuItem>
                      )}
                      {order.status !== "received" && (
                        <DropdownMenuItem onClick={() => changeStatus(order.id, "backward")}>
                          <ArrowDownCircle className="mr-2 h-4 w-4" />
                          <span>Move Backward</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => deleteOrder(order.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete Order</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
