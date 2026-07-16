import { CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function OrderContent({
  total,
  customer,
  items,
  placedAt,
}: {
  total: string;
  customer: string;
  items: string;
  placedAt: number;
}) {
  const [timeAgo, setTimeAgo] = useState(() => getTimeAgo(placedAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(getTimeAgo(placedAt));
    }, 60_000);
    return () => clearInterval(interval);
  }, [placedAt]);

  return (
    <CardContent>
      <div className="text-2xl font-bold">{total}</div>
      <p className="text-xs text-muted-foreground mt-1">{customer}</p>
      <p className="text-sm mt-2 line-clamp-2">{items}</p>
      <p className="text-xs text-muted-foreground mt-2">
        received {timeAgo}
      </p>
    </CardContent>
  );
}
