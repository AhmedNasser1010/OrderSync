"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const cancellationData = [
  { date: "2023-06-01", cancellations: 10 },
  { date: "2023-06-02", cancellations: 8 },
  { date: "2023-06-03", cancellations: 12 },
  { date: "2023-06-04", cancellations: 7 },
  { date: "2023-06-05", cancellations: 9 },
  { date: "2023-06-06", cancellations: 11 },
  { date: "2023-06-07", cancellations: 6 },
];

export default function Cancellations() {
  return (
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
  );
}
