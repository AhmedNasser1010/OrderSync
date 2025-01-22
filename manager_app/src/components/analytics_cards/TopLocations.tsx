"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const topLocations = [
  { name: "Downtown", orders: 500 },
  { name: "Suburb A", orders: 300 },
  { name: "Suburb B", orders: 200 },
  { name: "Business District", orders: 400 },
  { name: "University Area", orders: 250 },
];

export default function TopLocations() {
  return (
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
  );
}
