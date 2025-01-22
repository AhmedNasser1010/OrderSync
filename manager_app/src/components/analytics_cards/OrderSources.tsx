"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const orderSourceData = [
  { name: "App", orders: 800 },
  { name: "Website", orders: 500 },
  { name: "Phone", orders: 200 },
];

export default function OrderSources() {
  return (
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
  );
}
