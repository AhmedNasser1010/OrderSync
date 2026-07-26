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
import { Star } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { CustomerFeedbackType } from "@ordersync/types";

interface ReviewsTableProps {
  reviews: CustomerFeedbackType[];
  customerNameMap: Record<string, string>;
  restaurantNameMap: Record<string, string>;
  isLoading?: boolean;
  isError?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  const colorMap: Record<number, string> = {
    5: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400",
    4: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
    3: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400",
    2: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-400",
    1: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400",
  };

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 px-2.5 py-1", colorMap[rating] ?? colorMap[3])}
    >
      <Star className="h-3 w-3 fill-current" />
      {rating.toFixed(1)}
    </Badge>
  );
}

export function ReviewsTable({
  reviews,
  customerNameMap,
  restaurantNameMap,
  isLoading = false,
  isError = false,
}: ReviewsTableProps) {
  if (isLoading) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <p className="text-muted-foreground">Loading reviews...</p>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <p className="text-destructive">Failed to load reviews.</p>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No reviews found</p>
          <p className="text-sm mt-1">
            Customer reviews will appear here once customers leave feedback
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
              Restaurant
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Rating
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Comment
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Date
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow
              key={review.orderId}
              className="border-border hover:bg-secondary/50"
            >
              <TableCell className="py-4">
                {(() => {
                  const name = customerNameMap[review.customerId] || "Unknown";
                  return (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground">
                          {review.customerId.length > 10
                            ? `${review.customerId.slice(0, 10)}...`
                            : review.customerId}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </TableCell>
              <TableCell className="py-4">
                {(() => {
                  const name = restaurantNameMap[review.restaurantId] || "Unknown";
                  return (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground">
                          {review.restaurantId.length > 10
                            ? `${review.restaurantId.slice(0, 10)}...`
                            : review.restaurantId}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </TableCell>
              <TableCell className="py-4">
                <StarRating rating={review.rating} />
              </TableCell>
              <TableCell className="py-4 text-sm text-foreground max-w-[300px]">
                <p className="line-clamp-2">
                  {review.comment || "—"}
                </p>
              </TableCell>
              <TableCell className="py-4 text-sm text-muted-foreground">
                {review.createdAt
                  ? format(new Date(review.createdAt), "MMM dd, yyyy")
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
