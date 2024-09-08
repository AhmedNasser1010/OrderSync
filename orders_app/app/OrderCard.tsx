import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpCircle, ArrowDownCircle, MoreVertical, Trash2, CheckCircle } from "lucide-react"

type OrderStatus = "received" | "ongoing" | "done"

type Order = {
  id: string
  customer: string
  items: string
  total: string
  status: OrderStatus
}

type OrderCardProps = {
  order: Order
  changeStatus: (orderId: string, direction: "forward" | "backward") => void
  printInvoice: (orderId: string) => void
  deleteOrder: (orderId: string) => void
}

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case "received":
      return <ArrowUpCircle className="h-4 w-4" />
    case "ongoing":
      return <ArrowDownCircle className="h-4 w-4" />
    case "done":
      return <CheckCircle className="h-4 w-4" />
  }
}

const OrderCard: React.FC<OrderCardProps> = ({ order, changeStatus, printInvoice, deleteOrder }) => {
  return (
    <Card key={order.id}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Order #{order.id}</CardTitle>
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
        <p className="text-xs text-muted-foreground mt-1">{order.customer}</p>
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
  )
}

export default OrderCard
