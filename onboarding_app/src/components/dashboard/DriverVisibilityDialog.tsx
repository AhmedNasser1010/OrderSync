"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, Eye, Store } from "lucide-react";
import {
  useUpdateDriverDocumentMutation,
  useFetchUserDataQuery,
  useFetchBusinessesQuery,
} from "@/rtk/api/firestoreApi";
import { useAuth } from "@/contexts/AuthContext";
import type { BusinessDocument, Driver } from "@ordersync/types";

interface DriverVisibilityDialogProps {
  driver: Driver | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DriverVisibilityDialog({
  driver,
  open,
  onOpenChange,
}: DriverVisibilityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {driver && (
          <VisibilityForm
            key={`${driver.uid}:${driver.updatedAt ?? 0}`}
            driver={driver}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function VisibilityForm({
  driver,
  onClose,
}: {
  driver: Driver;
  onClose: () => void;
}) {
  const authUser = useAuth().user;

  const { data: userData } = useFetchUserDataQuery(authUser?.uid ?? "", {
    skip: !authUser?.uid,
  });
  const {
    data: businesses = [],
    isLoading: isLoadingBusinesses,
  } = useFetchBusinessesQuery(userData?.data?.businesses, {
    skip: !userData?.data?.businesses,
  });

  const initialIds = useMemo(
    () => driver.visibleBusinessIds ?? [],
    [driver.visibleBusinessIds],
  );

  const [allRestaurants, setAllRestaurants] = useState(initialIds.length === 0);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [updateDriverDocument] = useUpdateDriverDocumentMutation();

  const sortedBusinesses = useMemo(
    () =>
      [...businesses].sort((a, b) =>
        (a.profile?.name ?? "").localeCompare(b.profile?.name ?? ""),
      ),
    [businesses],
  );

  const toggleRestaurant = (accessToken: string) => {
    setSelectedIds((prev) =>
      prev.includes(accessToken)
        ? prev.filter((id) => id !== accessToken)
        : [...prev, accessToken],
    );
  };

  const canSave = allRestaurants || selectedIds.length > 0;

  const handleSubmit = async () => {
    if (!canSave) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await updateDriverDocument({
        uid: driver.uid,
        updates: {
          visibleBusinessIds: allRestaurants ? [] : selectedIds,
        },
      }).unwrap();
      onClose();
    } catch (error: unknown) {
      setSubmitError(
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "Failed to update order visibility",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <DialogTitle>Order Visibility</DialogTitle>
        </div>
        <DialogDescription>
          Choose which restaurants&apos; orders{" "}
          {driver.userInfo?.name || "this driver"} sees in the marketplace.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="visibility-all-restaurants">All Restaurants</Label>
            <p className="text-sm text-muted-foreground">
              Show orders from every restaurant
            </p>
          </div>
          <Switch
            id="visibility-all-restaurants"
            checked={allRestaurants}
            onCheckedChange={setAllRestaurants}
          />
        </div>

        {!allRestaurants && (
          <div className="space-y-2">
            <Label>Visible Restaurants</Label>
            {isLoadingBusinesses ? (
              <div className="flex justify-center rounded-lg border border-border p-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : sortedBusinesses.length === 0 ? (
              <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
                No restaurants found
              </p>
            ) : (
              <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                {sortedBusinesses.map((business: BusinessDocument) => (
                  <label
                    key={business.accessToken}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-secondary/50"
                  >
                    <Checkbox
                      checked={selectedIds.includes(business.accessToken)}
                      onCheckedChange={() =>
                        toggleRestaurant(business.accessToken)
                      }
                    />
                    <Store className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm">
                      {business.profile?.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {!isLoadingBusinesses && sortedBusinesses.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedIds.length} of {sortedBusinesses.length} selected
              </p>
            )}
          </div>
        )}

        {submitError && (
          <p className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3 w-3" />
            {submitError}
          </p>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!canSave || isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
