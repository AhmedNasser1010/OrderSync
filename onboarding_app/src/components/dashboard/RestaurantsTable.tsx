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
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Restaurant } from "@/lib/mock-data";
import { DeleteDialog } from "./DeleteDialog";
import { format } from "date-fns";

interface RestaurantsTableProps {
  restaurants: Restaurant[];
  onDelete: (id: string) => void;
}

export function RestaurantsTable({
  restaurants,
  onDelete,
}: RestaurantsTableProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });

  const handleDeleteConfirm = () => {
    if (deleteDialog.id) {
      onDelete(deleteDialog.id);
      setDeleteDialog({ open: false, id: null });
    }
  };

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
                key={restaurant.id}
                className="border-border hover:bg-secondary/50"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {restaurant.info.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {restaurant.info.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {restaurant.info.arabicName}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div>
                    <p className="text-sm text-foreground">
                      {restaurant.owner.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {restaurant.owner.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge variant="outline" className="capitalize">
                    {restaurant.info.industry.replace("-", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    className="capitalize"
                    variant={
                      restaurant.status === "open" ? "default" : "secondary"
                    }
                  >
                    {restaurant.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-sm text-muted-foreground">
                  {format(
                    new Date(restaurant.lastUpdated),
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
                      <Link href={`/restaurants/${restaurant.id}/edit`}>
                        <DropdownMenuItem className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive cursor-pointer"
                        onClick={() =>
                          setDeleteDialog({ open: true, id: restaurant.id })
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
        onOpenChange={(open) => setDeleteDialog({ open, id: deleteDialog.id })}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
