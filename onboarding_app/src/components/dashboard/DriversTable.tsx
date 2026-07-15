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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import type { Driver } from "@ordersync/types";
import { EditDriverDialog } from "./EditDriverDialog";

interface DriversTableProps {
  drivers: Driver[];
  onDelete: (uid: string) => void | Promise<void>;
}

export function DriversTable({ drivers, onDelete }: DriversTableProps) {
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    driver: Driver | null;
  }>({ open: false, driver: null });

  const handleEdit = (driver: Driver) => {
    setEditDriver(driver);
    setEditOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.driver) {
      onDelete(deleteDialog.driver.uid);
      setDeleteDialog({ open: false, driver: null });
    }
  };

  if (drivers.length === 0) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No drivers found</p>
          <p className="text-sm mt-1">Add a driver to get started</p>
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
                Driver
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Phone
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Status
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Created
              </TableHead>
              <TableHead className="text-foreground font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((driver) => {
              const displayName =
                driver.userInfo?.name ||
                driver.userInfo?.email?.split("@")[0] ||
                "Unknown";

              return (
                <TableRow
                  key={driver.uid}
                  className="border-border hover:bg-secondary/50"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {driver.userInfo?.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground">
                    {driver.userInfo?.phone || "—"}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant={
                        driver.online?.byManager ? "default" : "secondary"
                      }
                    >
                      {driver.online?.byManager ? "Online" : "Offline"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground">
                    {driver.createdAt
                      ? format(new Date(driver.createdAt), "MMM dd, yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-secondary/80"
                        onClick={() => handleEdit(driver)}
                        title="Edit driver"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          setDeleteDialog({ open: true, driver })
                        }
                        title="Delete driver"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <EditDriverDialog
        driver={editDriver}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, driver: deleteDialog.driver })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle>Delete Driver?</DialogTitle>
                <DialogDescription className="mt-1">
                  This will permanently delete the driver&apos;s account and
                  all associated data. This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, driver: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
