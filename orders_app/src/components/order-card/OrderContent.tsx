import { CardContent } from "@/components/ui/card";

export default function OrderContent({ total, customer, items }: { total: string, customer: string, items: string }) {
  return (
    <CardContent>
      <div className="text-2xl font-bold">{total}</div>
      <p className="text-xs text-muted-foreground mt-1">{customer}</p>
      <p className="text-sm mt-2 line-clamp-2">{items}</p>
    </CardContent>
  );
}
