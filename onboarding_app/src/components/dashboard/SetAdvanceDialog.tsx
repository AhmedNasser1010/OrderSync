"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Wallet } from "lucide-react";
import { useInitializeDailyAdvanceMutation } from "@/rtk/api/firestoreApi";
import type { Driver } from "@ordersync/types";

interface SetAdvanceDialogProps {
  driver: Driver | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SetAdvanceDialog({
  driver,
  open,
  onOpenChange,
}: SetAdvanceDialogProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [initializeAdvance, { isLoading }] =
    useInitializeDailyAdvanceMutation();

  useEffect(() => {
    if (open && driver) {
      setAmount(
        driver.finance?.dailyAdvance != null
          ? String(driver.finance.dailyAdvance)
          : "",
      );
      setError(null);
    }
  }, [open, driver]);

  const handleSubmit = async () => {
    if (!driver?.uid) return;

    const parsed = parseInt(amount);
    if (!parsed || parsed <= 0) {
      setError("Amount must be a positive number.");
      return;
    }

    setError(null);
    try {
      await initializeAdvance({ uid: driver.uid, amount: parsed }).unwrap();
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.data || err?.message || "Failed to set advance.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Set Daily Advance</DialogTitle>
              <DialogDescription className="mt-1">
                Initialize the advance for{" "}
                <span className="font-medium text-foreground">
                  {driver?.userInfo?.name || "this driver"}
                </span>
                . This resets the remaining advance balance.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-2 pt-2">
          <Label htmlFor="advance-amount">Advance Amount (EGP)</Label>
          <Input
            id="advance-amount"
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError(null);
            }}
            placeholder="e.g. 500"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !amount}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Set Advance
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
