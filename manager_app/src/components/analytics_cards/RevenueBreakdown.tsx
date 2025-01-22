"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const revenueData = [
  { name: "Revenue", value: 50000 },
  { name: "Discounts", value: 5000 },
  { name: "Delivery Fees", value: 3000 },
];

export default function RevenueBreakdown() {
  return (
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
  );
}
