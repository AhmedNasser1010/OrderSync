"use client";

import { CustomerData } from "@/lib/types/types";
import { User } from "lucide-react";

interface CustomerAnalyticsProps {
  data: CustomerData;
}

export function CustomerAnalytics({ data }: CustomerAnalyticsProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">
        Customer Analytics
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-muted rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">Total Customers</p>
          <p className="text-xl font-bold text-card-foreground">
            {data.totalCustomers}
          </p>
        </div>
        <div className="bg-muted rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">
            Returning Customers
          </p>
          <p className="text-xl font-bold text-card-foreground">
            {data.returningPercentage}%
          </p>
        </div>
      </div>

      <div className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <p className="text-xs font-semibold text-purple-900 dark:text-purple-200">
            Top Customer
          </p>
        </div>
        <p className="text-sm font-bold text-purple-900 dark:text-purple-100 mb-1">
          {data.topCustomer.name}
        </p>
        <div className="flex justify-between text-xs text-purple-700 dark:text-purple-300">
          <span>{data.topCustomer.totalOrderCount} orders</span>
          <span className="font-semibold">
            ${data.topCustomer.totalOrdersValue}
          </span>
        </div>
      </div>
    </div>
  );
}
