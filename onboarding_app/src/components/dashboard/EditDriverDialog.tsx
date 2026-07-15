"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, AlertCircle, Pencil } from "lucide-react";
import { useUpdateDriverDocumentMutation } from "@/rtk/api/firestoreApi";
import type { Driver } from "@ordersync/types";

interface EditDriverDialogProps {
  driver: Driver | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDriverDialog({
  driver,
  open,
  onOpenChange,
}: EditDriverDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [secondPhone, setSecondPhone] = useState("");
  const [licensePlateLetters, setLicensePlateLetters] = useState("");
  const [licensePlateNumbers, setLicensePlateNumbers] = useState("");
  const [warningLimit, setWarningLimit] = useState("");
  const [blockLimit, setBlockLimit] = useState("");
  const [onlineByManager, setOnlineByManager] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [updateDriverDocument] = useUpdateDriverDocumentMutation();

  useEffect(() => {
    if (open && driver) {
      setName(driver.userInfo?.name ?? "");
      setPhone(driver.userInfo?.phone ?? "");
      setSecondPhone(driver.userInfo?.secondPhone ?? "");
      setLicensePlateLetters(driver.licensePlate?.letters ?? "");
      setLicensePlateNumbers(
        driver.licensePlate?.numbers != null
          ? String(driver.licensePlate.numbers)
          : "",
      );
      setWarningLimit(
        driver.finance?.warningLimit != null
          ? String(driver.finance.warningLimit)
          : "",
      );
      setBlockLimit(
        driver.finance?.blockLimit != null
          ? String(driver.finance.blockLimit)
          : "",
      );
      setOnlineByManager(driver.online?.byManager ?? false);
      setSubmitError(null);
    }
  }, [open, driver]);

  const handleSubmit = async () => {
    if (!driver?.uid) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const userInfo: Record<string, string> = {
        ...driver.userInfo,
        name,
        phone,
      };
      if (secondPhone) {
        userInfo.secondPhone = secondPhone;
      } else {
        delete userInfo.secondPhone;
      }

      const updates: Record<string, unknown> = {
        userInfo,
        online: {
          ...driver.online,
          byManager: onlineByManager,
        },
      };

      if (licensePlateLetters || licensePlateNumbers) {
        updates.licensePlate = {
          letters: licensePlateLetters.toUpperCase(),
          numbers: licensePlateNumbers ? parseInt(licensePlateNumbers) : 0,
        };
      }

      const newWarningLimit = warningLimit ? parseInt(warningLimit) : undefined;
      const newBlockLimit = blockLimit ? parseInt(blockLimit) : undefined;
      if (newWarningLimit != null || newBlockLimit != null) {
        updates.finance = {
          ...driver.finance,
          ...(newWarningLimit != null && { warningLimit: newWarningLimit }),
          ...(newBlockLimit != null && { blockLimit: newBlockLimit }),
        };
      }

      await updateDriverDocument({
        uid: driver.uid,
        updates,
      }).unwrap();

      onOpenChange(false);
    } catch (error: any) {
      setSubmitError(error?.data || error?.message || "Failed to update driver");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            <DialogTitle>Edit Driver</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="edit-driver-email">Email Address</Label>
            <Input
              id="edit-driver-email"
              value={driver?.userInfo?.email ?? ""}
              disabled
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="edit-driver-name">Full Name</Label>
            <Input
              id="edit-driver-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mohammed Ali"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="edit-driver-phone">Phone Number</Label>
            <Input
              id="edit-driver-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +966501234567"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="edit-driver-second-phone">
              Second Phone Number (optional)
            </Label>
            <Input
              id="edit-driver-second-phone"
              value={secondPhone}
              onChange={(e) => setSecondPhone(e.target.value)}
              placeholder="e.g. +966501234568"
              className="mt-1.5"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-plate-letters">
                Plate Letters (optional)
              </Label>
              <Input
                id="edit-plate-letters"
                value={licensePlateLetters}
                onChange={(e) =>
                  setLicensePlateLetters(e.target.value.toUpperCase())
                }
                placeholder="e.g. ABC"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-plate-numbers">
                Plate Numbers (optional)
              </Label>
              <Input
                id="edit-plate-numbers"
                type="number"
                value={licensePlateNumbers}
                onChange={(e) => setLicensePlateNumbers(e.target.value)}
                placeholder="e.g. 1234"
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-warning-limit">Warning Limit</Label>
              <Input
                id="edit-warning-limit"
                type="number"
                value={warningLimit}
                onChange={(e) => setWarningLimit(e.target.value)}
                placeholder="e.g. 350"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-block-limit">Block Limit</Label>
              <Input
                id="edit-block-limit"
                type="number"
                value={blockLimit}
                onChange={(e) => setBlockLimit(e.target.value)}
                placeholder="e.g. 500"
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="edit-online-by-manager">
                Online by Manager
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable this driver&apos;s online status
              </p>
            </div>
            <Switch
              id="edit-online-by-manager"
              checked={onlineByManager}
              onCheckedChange={setOnlineByManager}
            />
          </div>
          {submitError && (
            <p className="flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-3 w-3" />
              {submitError}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || !phone || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
