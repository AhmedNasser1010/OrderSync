"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OrderType } from "@ordersync/types";

function timeSince(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

interface ReceivedOrdersTableProps {
  orders: OrderType[];
  restaurantNameMap: Record<string, string>;
  isLoading?: boolean;
  isError?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function CartSummary({ cart }: { cart: OrderType["cart"] }) {
  if (!cart || cart.length === 0) return <span className="text-muted-foreground">—</span>;
  const summary = cart
    .slice(0, 2)
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(", ");
  const remaining = cart.length - 2;
  return (
    <p className="text-sm text-foreground line-clamp-1">
      {summary}
      {remaining > 0 && ` +${remaining} more`}
    </p>
  );
}

function FinanceCell({
  label,
  amount,
}: {
  label: string;
  amount: number;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">
        {formatCurrency(amount)}
      </span>
    </div>
  );
}

export function ReceivedOrdersTable({
  orders,
  restaurantNameMap,
  isLoading = false,
  isError = false,
}: ReceivedOrdersTableProps) {
  if (isLoading) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <p className="text-muted-foreground">Loading received orders...</p>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <p className="text-destructive">Failed to load received orders.</p>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No received orders found</p>
          <p className="text-sm mt-1">
            Orders waiting for restaurant acceptance will appear here
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
              Customer
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Restaurant
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Items
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Total
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Commission
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Restaurant Net
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Driver Earnings
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Since
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const customerName = order.customer?.name || "Unknown";
            const restaurantName =
              restaurantNameMap[order.businessId] ||
              order.business?.name ||
              "Unknown";

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
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                        {restaurantName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {restaurantName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.business?.phone || "—"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 max-w-[200px]">
                  <CartSummary cart={order.cart} />
                </TableCell>
                <TableCell className="py-4 text-sm font-medium text-foreground">
                  {formatCurrency(order.pricing?.total ?? 0)}
                </TableCell>
                <TableCell className="py-4">
                  <FinanceCell
                    label={`${order.finance?.commissionPercent ?? 0}%`}
                    amount={order.finance?.commissionAmount ?? 0}
                  />
                </TableCell>
                <TableCell className="py-4">
                  <FinanceCell
                    label="Net"
                    amount={order.finance?.restaurantShare ?? 0}
                  />
                </TableCell>
                <TableCell className="py-4">
                  <FinanceCell
                    label="Fee"
                    amount={order.finance?.driverEarnings ?? 0}
                  />
                </TableCell>
                <TableCell className="py-4 text-sm font-medium text-muted-foreground">
                  {order.createdAt ? timeSince(order.createdAt) : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
