"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const orderDurationData = [
  { date: "2023-06-01", preparation: 20, delivery: 30, completion: 50 },
  { date: "2023-06-02", preparation: 22, delivery: 28, completion: 50 },
  { date: "2023-06-03", preparation: 18, delivery: 32, completion: 50 },
  { date: "2023-06-04", preparation: 25, delivery: 25, completion: 50 },
  { date: "2023-06-05", preparation: 21, delivery: 29, completion: 50 },
  { date: "2023-06-06", preparation: 19, delivery: 31, completion: 50 },
  { date: "2023-06-07", preparation: 23, delivery: 27, completion: 50 },
];

export default function OrderDurations() {
  return (
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
  );
}
