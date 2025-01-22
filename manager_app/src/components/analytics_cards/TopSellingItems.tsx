"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const topSellingItems = [
  { name: "Pizza", quantity: 500 },
  { name: "Burger", quantity: 450 },
  { name: "Salad", quantity: 300 },
  { name: "Pasta", quantity: 250 },
  { name: "Dessert", quantity: 200 },
];

export default function TopSellingItems() {
  return (
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
  );
}
