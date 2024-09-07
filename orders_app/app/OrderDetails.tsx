"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, MapPin, Phone, Mail, Clock, Printer, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

type OrderStatus = "received" | "ongoing" | "done"

type OrderItem = {
  name: string
  quantity: number
  price: number
  notes?: string
  options?: { [key: string]: string }
  image: string
}

type Order = {
  id: string
  status: OrderStatus
  customer: {
    name: string
    phone: string
    email: string
    address: string
  }
  placedOn: string
  acceptedOn: string
  fulfillmentOn: string
  paymentMethod: string
  items: OrderItem[]
  subtotal: number
  total: number
}

const mockOrder: Order = {
  id: "916573580",
  status: "received",
  customer: {
    name: "John Doe",
    phone: "0123 456 789",
    email: "john.doe@email.com",
    address: "14th Test Street, 1st Floor, Apartment 5B, ayyat"
  },
  placedOn: "Sat 7 Sep - 04:17PM",
  acceptedOn: "Sat 7 Sep - 04:18PM",
  fulfillmentOn: "Sat 7 Sep - 04:43PM",
  paymentMethod: "Cash",
  items: [
    {
      name: "Pizza Prosciutto",
      quantity: 2,
      price: 11.60,
      notes: "No mushrooms, please!",
      options: {
        "Size": "Small",
        "Crust": "Fluffy",
        "Toppings": "Extra mozzarella"
      },
      image: "/placeholder.svg?height=100&width=100"
    }
  ],
  subtotal: 11.60,
  total: 11.60
}

export default function OrderDetails() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    // In a real application, you would fetch the order data from an API
    // For this example, we're using mock data
    setOrder(mockOrder)
  }, [params.id])

  if (!order) {
    return <div>Loading...</div>
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "received":
        return "bg-blue-500"
      case "ongoing":
        return "bg-yellow-500"
      case "done":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const openMap = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer.address)}`, '_blank')
  }

  const printOrder = () => {
    window.print()
  }

  return (
    <div className="container mx-auto p-4 bg-background text-foreground">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/" passHref>
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={`${getStatusColor(order.status)} text-white`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
          <Badge variant="outline">{order.paymentMethod}</Badge>
          <Button variant="outline" size="sm" onClick={printOrder}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{order.customer.address}</span>
                </div>
                <Button variant="outline" size="sm" onClick={openMap}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Map
                </Button>
              </div>
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                <span>{order.customer.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                <span>{order.customer.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Placed on:</span>
                <span>{order.placedOn}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Accepted on:</span>
                <span>{order.acceptedOn}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fulfillment:</span>
                <span>{order.fulfillmentOn}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={100}
                  height={100}
                  className="rounded-md object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.name}</span>
                    <span>{item.quantity} x ${item.price.toFixed(2)}</span>
                  </div>
                  {item.notes && <div className="text-sm text-muted-foreground">{item.notes}</div>}
                  {item.options && (
                    <div className="text-sm mt-1">
                      {Object.entries(item.options).map(([key, value]) => (
                        <span key={key} className="mr-2">{key}: {value}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardContent>
          <div className="flex justify-between items-center py-2">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between items-center py-2 font-bold">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}