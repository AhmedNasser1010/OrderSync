"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const revenueTrendData = [
  { date: "2023-06-01", revenue: 45000 },
  { date: "2023-06-02", revenue: 47000 },
  { date: "2023-06-03", revenue: 49000 },
  { date: "2023-06-04", revenue: 51000 },
  { date: "2023-06-05", revenue: 53000 },
  { date: "2023-06-06", revenue: 55000 },
  { date: "2023-06-07", revenue: 57000 },
];

export default function RevenueTrend() {
  return (
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
  );
}
