"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import type { OrderStatusType, OrderType } from "@ordersync/types";

export const ORDER_STATUS_CONFIG: Record<
  OrderStatusType,
  { label: string; badgeClass: string }
> = {
  RECEIVED: {
    label: "Received",
    badgeClass:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
  },
  ACCEPTED: {
    label: "Accepted",
    badgeClass:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400",
  },
  PREPARING: {
    label: "Preparing",
    badgeClass:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-400",
  },
  READY: {
    label: "Ready",
    badgeClass:
      "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-400",
  },
  RESERVED: {
    label: "Reserved",
    badgeClass:
      "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-400",
  },
  PICKED_UP: {
    label: "Picked Up",
    badgeClass:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-400",
  },
  ON_ROUTE: {
    label: "On Route",
    badgeClass:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-400",
  },
  DELIVERED: {
    label: "Delivered",
    badgeClass:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400",
  },
  GIVEN_FEEDBACK: {
    label: "Feedback Given",
    badgeClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
  CANCELED: {
    label: "Canceled",
    badgeClass:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400",
  },
  REJECTED: {
    label: "Rejected",
    badgeClass:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400",
  },
  VOIDED: {
    label: "Voided",
    badgeClass:
      "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-800 dark:bg-gray-950/50 dark:text-gray-400",
  },
};

export function formatOrderDate(timestamp?: number): string {
  if (!timestamp) return "—";
  return format(new Date(timestamp), "MMM d, yyyy HH:mm");
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function OrderStatusBadge({ status }: { status?: OrderStatusType }) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  const config = ORDER_STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.badgeClass}>
      {config.label}
    </Badge>
  );
}

interface OrderLookupTableProps {
  orders: OrderType[];
  isLoading?: boolean;
  isError?: boolean;
  onView: (order: OrderType) => void;
}

export function OrderLookupTable({
  orders,
  isLoading = false,
  isError = false,
  onView,
}: OrderLookupTableProps) {
  if (isLoading) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <p className="text-muted-foreground">Searching orders...</p>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <p className="text-destructive">
          Search failed. If an index is still building, try again in a few
          minutes.
        </p>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No matching orders</p>
          <p className="text-sm mt-1">
            Try a different identifier or check the value for typos
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-card border-border">
      <Table>
        <TableHeader className="bg-secondary/50 border-b border-border">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-foreground font-semibold">
              Order #
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Status
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Customer
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Restaurant
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Total
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Placed At
            </TableHead>
            <TableHead className="text-foreground font-semibold text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const customerName = order.customer?.name || "Unknown";
            const restaurantName =
              order.business?.name || order.businessId || "Unknown";

            return (
              <TableRow
                key={order.id}
                className="border-border hover:bg-secondary/50"
              >
                <TableCell className="py-4">
                  <span className="font-mono text-sm font-medium text-foreground">
                    #{order.orderNumber}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <OrderStatusBadge status={order.status?.current} />
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {customerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer?.phone || "—"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 max-w-[220px]">
                  <div>
                    <p className="font-medium text-foreground truncate">
                      {restaurantName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate font-mono">
                      {order.id}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-sm font-medium text-foreground">
                  {formatCurrency(order.pricing?.total ?? 0)}
                </TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground">
                  {formatOrderDate(order.createdAt)}
                </TableCell>
                <TableCell className="py-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => onView(order)}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
