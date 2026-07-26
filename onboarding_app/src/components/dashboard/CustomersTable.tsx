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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { CustomerType } from "@ordersync/types";

interface CustomersTableProps {
  customers: CustomerType[];
  isLoading?: boolean;
  isError?: boolean;
}

function getLastOrderTime(customer: CustomerType): number | null {
  if (!customer.restaurants || customer.restaurants.length === 0) return null;
  return Math.max(...customer.restaurants.map((r) => r.lastOrderTime));
}

export function CustomersTable({
  customers,
  isLoading = false,
  isError = false,
}: CustomersTableProps) {
  if (isLoading) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <p className="text-muted-foreground">Loading customers...</p>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <p className="text-destructive">Failed to load customers.</p>
      </Card>
    );
  }

  if (customers.length === 0) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No customers found</p>
          <p className="text-sm mt-1">
            Customers who order from your restaurants will appear here
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
              Customer
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Phone
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Email
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              City
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Joined
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Last Order
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => {
            const name =
              customer.userInfo?.name ||
              customer.userInfo?.email?.split("@")[0] ||
              "Unknown";
            const email = customer.userInfo?.email || "";
            const phone = customer.userInfo?.phone || "";
            const city = customer.locations?.city || "—";
            const lastOrderTime = getLastOrderTime(customer);
            const totalOrders =
              customer.restaurants?.reduce(
                (sum, r) => sum + r.totalOrders,
                0,
              ) ?? 0;

            return (
              <TableRow
                key={customer.uid}
                className="border-border hover:bg-secondary/50"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        {totalOrders} order{totalOrders !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground">
                  {phone || "—"}
                </TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground">
                  {email || "—"}
                </TableCell>
                <TableCell className="py-4">
                  <Badge variant="outline" className="capitalize">
                    {city}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground">
                  {customer.createdAt
                    ? format(new Date(customer.createdAt), "MMM dd, yyyy")
                    : "—"}
                </TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground">
                  {lastOrderTime
                    ? format(new Date(lastOrderTime), "MMM dd, yyyy")
                    : "—"}
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant="outline"
                    className="gap-1.5 px-2.5 py-1 border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400"
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                    Active
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
