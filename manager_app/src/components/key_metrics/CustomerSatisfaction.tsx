import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function CustomerSatisfaction() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          Customer Satisfaction
        </CardTitle>
        <Star className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">4.7 / 5</div>
        <p className="text-xs text-muted-foreground">Based on 1,234 ratings</p>
      </CardContent>
    </Card>
  );
}
