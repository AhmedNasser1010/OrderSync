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
import { Trash2, UserX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import type { ManagerUser } from "@ordersync/types";

interface ManagersTableProps {
  managers: ManagerUser[];
  onDelete: (uid: string) => void | Promise<void>;
  isLoading?: boolean;
  isError?: boolean;
}

export function ManagersTable({
  managers,
  onDelete,
  isLoading = false,
  isError = false,
}: ManagersTableProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    uid: string | null;
  }>({ open: false, uid: null });

  const handleDeleteConfirm = () => {
    if (deleteDialog.uid) {
      onDelete(deleteDialog.uid);
      setDeleteDialog({ open: false, uid: null });
    }
  };

  if (isLoading) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <p className="text-muted-foreground">Loading managers...</p>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <p className="text-destructive">Failed to load managers.</p>
      </Card>
    );
  }

  if (managers.length === 0) {
    return (
      <Card className="p-12 bg-card border-border text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No managers found</p>
          <p className="text-sm mt-1">
            Managers added to your restaurants will appear here
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
                Manager
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Phone
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Role
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Business ID
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Joined
              </TableHead>
              <TableHead className="text-foreground font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {managers.map((manager) => {
              const name =
                manager.userInfo?.name ||
                manager.userInfo?.email?.split("@")[0] ||
                "Unknown";
              const email = manager.userInfo?.email || "";
              const phone = manager.userInfo?.phone || "";
              const role = manager.userInfo?.role || "MANAGER";

              return (
                <TableRow
                  key={manager.uid}
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
                        {email && (
                          <p className="text-xs text-muted-foreground">
                            {email}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-foreground">
                    {phone || "—"}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="secondary" className="capitalize">
                      {role.replace(/_/g, " ").toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                      {manager.accessToken}
                    </code>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground">
                    {manager.createdAt
                      ? format(new Date(manager.createdAt), "MMM dd, yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() =>
                        setDeleteDialog({ open: true, uid: manager.uid })
                      }
                      title="Delete manager"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, uid: deleteDialog.uid })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle>Remove Manager?</DialogTitle>
                <DialogDescription className="mt-1">
                  This will permanently delete the manager&apos;s account and
                  remove their access to all associated businesses. This action
                  cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, uid: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              <UserX className="mr-2 h-4 w-4" />
              Remove Manager
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
