"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import type { BusinessDocument, RestaurantStatusTypes } from "@ordersync/types";
import { useSetRestaurantStatusMutation } from "@/rtk/api/firestoreApi";
import { cn } from "@/lib/utils";
import { DeleteDialog } from "./DeleteDialog";
import { format } from "date-fns";

const statusOptions: { value: RestaurantStatusTypes; label: string; dotColor: string; badgeClass: string }[] = [
  { value: "active", label: "Active", dotColor: "bg-green-500", badgeClass: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400" },
  { value: "busy", label: "Busy", dotColor: "bg-yellow-500", badgeClass: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400" },
  { value: "pause", label: "Paused", dotColor: "bg-red-500", badgeClass: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400" },
  { value: "inactive", label: "Inactive", dotColor: "bg-gray-400", badgeClass: "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400" },
];

function getStatusConfig(status: RestaurantStatusTypes) {
  return statusOptions.find((s) => s.value === status) ?? statusOptions[3];
}

interface RestaurantsTableProps {
  restaurants: BusinessDocument[];
  onDelete: (accessToken: string) => void | Promise<void>;
  isLoading?: boolean;
  isError?: boolean;
}

export function RestaurantsTable({
  restaurants,
  onDelete,
  isLoading = false,
  isError = false,
}: RestaurantsTableProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    accessToken: string | null;
  }>({
    open: false,
    accessToken: null,
  });
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [setRestaurantStatus] = useSetRestaurantStatusMutation();

  const handleStatusChange = async (
    accessToken: string,
    status: RestaurantStatusTypes,
  ) => {
    setUpdatingStatus(accessToken);
    try {
      await setRestaurantStatus({ resId: accessToken, status }).unwrap();
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.accessToken) {
      onDelete(deleteDialog.accessToken);
      setDeleteDialog({ open: false, accessToken: null });
    }
  };

  if (isLoading) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <p className="text-muted-foreground">Loading restaurants...</p>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <p className="text-destructive">Failed to load restaurants.</p>
      </Card>
    );
  }

  if (restaurants.length === 0) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No restaurants found</p>
          <p className="text-sm mt-1">
            Try adjusting your filters or add a new restaurant
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden bg-card border-border">
        <Table>
          <TableHeader className="bg-secondary/50 border-b border-border">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-foreground font-semibold">
                Restaurant
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Owner
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Industry
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Status
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Last Updated
              </TableHead>
              <TableHead className="text-foreground font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {restaurants.map((restaurant) => (
              <TableRow
                key={restaurant.accessToken}
                className="border-border hover:bg-secondary/50"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {restaurant.profile.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {restaurant.profile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {restaurant.profile.nameInAr}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div>
                    <p className="text-sm text-foreground">
                      {restaurant.owner.name ?? restaurant.owner.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {restaurant.owner.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge variant="outline" className="capitalize">
                    {restaurant.profile.industry.replace("-", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  {updatingStatus === restaurant.accessToken ? (
                    <Badge
                      variant="outline"
                      className="gap-1.5 px-2.5 py-1"
                    >
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Updating...
                    </Badge>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="cursor-pointer">
                          <Badge
                            variant="outline"
                            className={cn(
                              "gap-1.5 px-2.5 py-1 capitalize transition-colors hover:opacity-80",
                              getStatusConfig(restaurant.status).badgeClass,
                            )}
                          >
                            <span
                              className={cn(
                                "inline-block h-1.5 w-1.5 rounded-full",
                                getStatusConfig(restaurant.status).dotColor,
                              )}
                            />
                            {restaurant.status}
                          </Badge>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {statusOptions.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() =>
                              handleStatusChange(
                                restaurant.accessToken,
                                option.value,
                              )
                            }
                            className={cn(
                              restaurant.status === option.value &&
                                "bg-accent text-accent-foreground",
                            )}
                          >
                            <div
                              className={cn(
                                "w-2.5 h-2.5 rounded-full mr-2",
                                option.dotColor,
                              )}
                            />
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground">
                  {format(
                    new Date(restaurant.updatedAt),
                    "MMM dd, yyyy hh:mm a",
                  )}
                </TableCell>
                <TableCell className="py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link
                        href={`/restaurants/${restaurant.accessToken}/edit`}
                      >
                        <DropdownMenuItem className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive cursor-pointer"
                        onClick={() =>
                          setDeleteDialog({
                            open: true,
                            accessToken: restaurant.accessToken,
                          })
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, accessToken: deleteDialog.accessToken })
        }
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
