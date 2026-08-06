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
import { ActionsMenu } from "@/components/ui/actions-menu";
import { Star, Eye, EyeOff, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { CustomerFeedbackType } from "@ordersync/types";

interface ReviewsTableProps {
  reviews: CustomerFeedbackType[];
  customerNameMap: Record<string, string>;
  restaurantNameMap: Record<string, string>;
  isLoading?: boolean;
  isError?: boolean;
  busyOrderId?: string | null;
  onToggleHidden?: (review: CustomerFeedbackType) => void;
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
  busyOrderId = null,
  onToggleHidden,
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
              Status
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Comment
            </TableHead>
            <TableHead className="text-foreground font-semibold">
              Date
            </TableHead>
            {onToggleHidden && (
              <TableHead className="text-foreground font-semibold text-right">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow
              key={review.orderId}
              className={cn(
                "border-border hover:bg-secondary/50",
                review.hidden && "opacity-60",
              )}
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
              <TableCell className="py-4">
                {review.hidden ? (
                  <Badge
                    variant="outline"
                    className="gap-1 px-2.5 py-1 border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400"
                  >
                    <EyeOff className="h-3 w-3" />
                    Hidden
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="gap-1 px-2.5 py-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                  >
                    <Eye className="h-3 w-3" />
                    Visible
                  </Badge>
                )}
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
              {onToggleHidden && (
                <TableCell className="py-4 text-right">
                  <div className="flex items-center justify-end">
                    {busyOrderId === review.orderId ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <ActionsMenu
                        items={[
                          {
                            key: review.hidden ? "show" : "hide",
                            label: review.hidden
                              ? "Show review"
                              : "Hide review",
                            icon: review.hidden ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            ),
                            onClick: () => onToggleHidden(review),
                          },
                        ]}
                      />
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
