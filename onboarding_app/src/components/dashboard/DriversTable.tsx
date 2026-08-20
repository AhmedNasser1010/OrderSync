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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2, AlertTriangle, Loader2, Wallet, Receipt, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import type { Driver } from "@ordersync/types";
import { EditDriverDialog } from "./EditDriverDialog";
import { SetAdvanceDialog } from "./SetAdvanceDialog";
import { SettleAccountDialog } from "./SettleAccountDialog";
import { useUpdateDriverDocumentMutation } from "@/rtk/api/firestoreApi";
import { Badge } from "@/components/ui/badge";
import { ButtonGuard } from "@/components/ui/button-guard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DriversTableProps {
  drivers: Driver[];
  onDelete: (uid: string) => void | Promise<void>;
}

export function DriversTable({ drivers, onDelete }: DriversTableProps) {
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [setAdvanceDriver, setSetAdvanceDriver] = useState<Driver | null>(null);
  const [setAdvanceOpen, setSetAdvanceOpen] = useState(false);
  const [settleDriver, setSettleDriver] = useState<Driver | null>(null);
  const [settleOpen, setSettleOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    driver: Driver | null;
  }>({ open: false, driver: null });

  const [updateDriver, { isLoading: isUpdating }] =
    useUpdateDriverDocumentMutation();
  const [togglingDriver, setTogglingDriver] = useState<string | null>(null);

  const handleEdit = (driver: Driver) => {
    setEditDriver(driver);
    setEditOpen(true);
  };

  const handleToggleByManager = async (driver: Driver) => {
    setTogglingDriver(driver.uid);
    try {
      await updateDriver({
        uid: driver.uid,
        updates: {
          online: { ...driver.online, byManager: !(driver.online?.byManager ?? false) },
        },
      }).unwrap();
    } finally {
      setTogglingDriver(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.driver) {
      try {
        await onDelete(deleteDialog.driver.uid);
      } finally {
        setDeleteDialog({ open: false, driver: null });
      }
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
      <Card className="bg-card border-border">
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
                Daily Advance
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Available
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
                    {togglingDriver === driver.uid ? (
                      <Badge
                        variant="outline"
                        className="gap-1.5 px-2.5 py-1"
                      >
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Updating...
                      </Badge>
                    ) : (
                      <button
                        className="cursor-pointer"
                        onClick={() => handleToggleByManager(driver)}
                        disabled={isUpdating}
                      >
                        <Badge
                          variant="outline"
                          className={cn(
                            "gap-1.5 px-2.5 py-1 transition-colors hover:opacity-80",
                            driver.online?.byManager
                              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400"
                              : "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400",
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-1.5 w-1.5 rounded-full",
                              driver.online?.byManager
                                ? "bg-green-500"
                                : "bg-gray-400",
                            )}
                          />
                          {driver.online?.byManager ? "Online" : "Offline"}
                        </Badge>
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground">
                    {driver.finance?.dailyAdvance?.toLocaleString() ?? "0"}
                  </TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground">
                    {((driver.finance?.dailyAdvance ?? 0) + (driver.finance?.earnings ?? 0)).toLocaleString()}
                  </TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground">
                    {driver.createdAt
                      ? format(new Date(driver.createdAt), "MMM dd, yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            setSetAdvanceDriver(driver);
                            setSetAdvanceOpen(true);
                          }}
                        >
                          <Wallet className="mr-2 h-4 w-4" />
                          <span>Set Advance</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            setSettleDriver(driver);
                            setSettleOpen(true);
                          }}
                        >
                          <Receipt className="mr-2 h-4 w-4" />
                          <span>Settle Account</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleEdit(driver)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Edit Driver</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer"
                          onClick={() =>
                            setDeleteDialog({ open: true, driver })
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete Driver</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      <SetAdvanceDialog
        driver={setAdvanceDriver}
        open={setAdvanceOpen}
        onOpenChange={setSetAdvanceOpen}
      />

      <SettleAccountDialog
        driver={settleDriver}
        open={settleOpen}
        onOpenChange={setSettleOpen}
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
            <ButtonGuard variant="destructive" onClick={handleDeleteConfirm}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Driver
            </ButtonGuard>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
