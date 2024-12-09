"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChefHat,
  DollarSign,
  ShoppingBag,
  Star,
  Users,
  CreditCard,
  Globe,
  XCircle,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data for charts
const revenueData = [
  { name: "Revenue", value: 50000 },
  { name: "Discounts", value: 5000 },
  { name: "Delivery Fees", value: 3000 },
];

const revenueTrendData = [
  { date: "2023-06-01", revenue: 45000 },
  { date: "2023-06-02", revenue: 47000 },
  { date: "2023-06-03", revenue: 49000 },
  { date: "2023-06-04", revenue: 51000 },
  { date: "2023-06-05", revenue: 53000 },
  { date: "2023-06-06", revenue: 55000 },
  { date: "2023-06-07", revenue: 57000 },
];

const topSellingItems = [
  { name: "Pizza", quantity: 500 },
  { name: "Burger", quantity: 450 },
  { name: "Salad", quantity: 300 },
  { name: "Pasta", quantity: 250 },
  { name: "Dessert", quantity: 200 },
];

const orderDurationData = [
  { date: "2023-06-01", preparation: 20, delivery: 30, completion: 50 },
  { date: "2023-06-02", preparation: 22, delivery: 28, completion: 50 },
  { date: "2023-06-03", preparation: 18, delivery: 32, completion: 50 },
  { date: "2023-06-04", preparation: 25, delivery: 25, completion: 50 },
  { date: "2023-06-05", preparation: 21, delivery: 29, completion: 50 },
  { date: "2023-06-06", preparation: 19, delivery: 31, completion: 50 },
  { date: "2023-06-07", preparation: 23, delivery: 27, completion: 50 },
];

const customerData = [
  { name: "New", value: 300 },
  { name: "Returning", value: 700 },
];

const paymentMethodData = [
  { name: "Credit Card", value: 600 },
  { name: "Cash", value: 300 },
  { name: "Digital Wallet", value: 100 },
];

const orderSourceData = [
  { name: "App", orders: 800 },
  { name: "Website", orders: 500 },
  { name: "Phone", orders: 200 },
];

const cancellationData = [
  { date: "2023-06-01", cancellations: 10 },
  { date: "2023-06-02", cancellations: 8 },
  { date: "2023-06-03", cancellations: 12 },
  { date: "2023-06-04", cancellations: 7 },
  { date: "2023-06-05", cancellations: 9 },
  { date: "2023-06-06", cancellations: 11 },
  { date: "2023-06-07", cancellations: 6 },
];

const topLocations = [
  { name: "Downtown", orders: 500 },
  { name: "Suburb A", orders: 300 },
  { name: "Suburb B", orders: 200 },
  { name: "Business District", orders: 400 },
  { name: "University Area", orders: 250 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function Component() {
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <div className="flex flex-col space-y-4 p-4 md:p-6 bg-background">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Restaurant Analytics</h1>
        <Select defaultValue={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$58,000</div>
              <p className="text-xs text-muted-foreground">
                +15.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Average Order Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$35.99</div>
              <p className="text-xs text-muted-foreground">
                +2.3% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Customer Satisfaction
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.7 / 5</div>
              <p className="text-xs text-muted-foreground">
                Based on 1,234 ratings
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="border-t"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              <ChartContainer
                config={{
                  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
                  discounts: {
                    label: "Discounts",
                    color: "hsl(var(--chart-2))",
                  },
                  fees: {
                    label: "Delivery Fees",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="w-[calc(100%-1rem)] md:w-full"
              >
                  <BarChart data={revenueData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="var(--color-revenue)" />
                  </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              <ChartContainer
                config={{
                  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
                }}
                className="w-[calc(100%-1rem)] md:w-full"
              >
                  <LineChart data={revenueTrendData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--color-revenue)"
                    />
                  </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              <ChartContainer
                config={{
                  quantity: {
                    label: "Quantity Sold",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="w-[calc(100%-1rem)] md:w-full"
              >
                  <BarChart data={topSellingItems}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="quantity" fill="var(--color-quantity)" />
                  </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Sources</CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              <ChartContainer
                config={{
                  orders: { label: "Orders", color: "hsl(var(--chart-1))" },
                }}
                className="w-[calc(100%-1rem)] md:w-full"
              >
                  <BarChart data={orderSourceData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="orders" fill="var(--color-orders)" />
                  </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Durations</CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              <ChartContainer
                config={{
                  preparation: {
                    label: "Preparation Time",
                    color: "hsl(var(--chart-1))",
                  },
                  delivery: {
                    label: "Delivery Time",
                    color: "hsl(var(--chart-2))",
                  },
                  completion: {
                    label: "Total Time",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="w-[calc(100%-1rem)] md:w-full"
              >
                  <LineChart data={orderDurationData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="preparation"
                      stroke="var(--color-preparation)"
                    />
                    <Line
                      type="monotone"
                      dataKey="delivery"
                      stroke="var(--color-delivery)"
                    />
                    <Line
                      type="monotone"
                      dataKey="completion"
                      stroke="var(--color-completion)"
                    />
                  </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cancellations</CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              <ChartContainer
                config={{
                  cancellations: {
                    label: "Cancellations",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="w-[calc(100%-1rem)] md:w-full"
              >
                  <LineChart data={cancellationData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="cancellations"
                      stroke="var(--color-cancellations)"
                    />
                  </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Locations</CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              <ChartContainer
                config={{
                  orders: { label: "Orders", color: "hsl(var(--chart-1))" },
                }}
                className="w-[calc(100%-1rem)] md:w-full"
              >
                  <BarChart data={topLocations} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="orders" fill="var(--color-orders)" />
                  </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Types</CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              <ChartContainer
                config={{
                  value: { label: "Customers", color: "hsl(var(--chart-1))" },
                }}
                className="w-[calc(100%)] md:w-full"
              >
                  <PieChart>
                    <Pie
                      data={customerData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {customerData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
