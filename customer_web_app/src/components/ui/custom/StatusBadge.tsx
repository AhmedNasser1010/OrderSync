import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  CLOSED: "Closed",
  PAUSED: "Paused",
  HIDDEN: "Hidden",
};

interface StatusBadgeProps {
  status?: string;
  className?: string;
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) return null;

  const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    OPEN: "default",
    PAUSED: "secondary",
    CLOSED: "destructive",
    HIDDEN: "outline",
  };

  return (
    <Badge
      variant={variantMap[status] || "outline"}
      className={cn("pointer-events-none", className)}
    >
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}

export default StatusBadge;
