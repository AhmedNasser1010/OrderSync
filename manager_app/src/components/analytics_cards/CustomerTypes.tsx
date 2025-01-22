"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pie, PieChart, Cell, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const customerData = [
  { name: "New", value: 300 },
  { name: "Returning", value: 700 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function CustomerTypes() {
  return (
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
  );
}
