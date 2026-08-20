"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Receipt, CheckCircle2 } from "lucide-react";
import { useSettleDriverAccountMutation } from "@/rtk/api/firestoreApi";
import type { Driver } from "@ordersync/types";

interface SettleAccountDialogProps {
  driver: Driver | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettleAccountDialog({
  driver,
  open,
  onOpenChange,
}: SettleAccountDialogProps) {
  const [settleAccount, { isLoading }] = useSettleDriverAccountMutation();
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSettle = async () => {
    if (!driver?.uid) return;

    setError(null);
    setResult(null);
    try {
      const res = await settleAccount({ uid: driver.uid }).unwrap();
      setResult(res.settlementAmount);
    } catch (err: any) {
      setError(err?.data || err?.message || "Failed to settle account.");
    }
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
    onOpenChange(false);
  };

  const dailyAdvance = driver?.finance?.dailyAdvance ?? 0;
  const earnings = driver?.finance?.earnings ?? 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle>Settle Account</DialogTitle>
              <DialogDescription className="mt-1">
                Settle account for{" "}
                <span className="font-medium text-foreground">
                  {driver?.userInfo?.name || "this driver"}
                </span>
                .
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {result !== null ? (
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Settlement complete</span>
            </div>
            <div className="rounded-lg border border-border p-3 space-y-1">
              <p className="text-sm text-muted-foreground">
                Daily Advance:{" "}
                <span className="font-medium text-foreground">
                  EGP {dailyAdvance.toLocaleString()}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Earnings:{" "}
                <span className="font-medium text-foreground">
                  EGP {earnings.toLocaleString()}
                </span>
              </p>
              <div className="border-t border-border mt-1 pt-1">
                <p className="text-sm font-semibold text-foreground">
                  Total Settled: EGP {result.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 py-2">
            <div className="rounded-lg border border-border p-3 space-y-1">
              <p className="text-sm text-muted-foreground">
                Daily Advance:{" "}
                <span className="font-medium text-foreground">
                  EGP {dailyAdvance.toLocaleString()}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Earnings:{" "}
                <span className="font-medium text-foreground">
                  EGP {earnings.toLocaleString()}
                </span>
              </p>
              <div className="border-t border-border mt-1 pt-1">
                <p className="text-sm font-semibold text-foreground">
                  Settlement Amount: EGP{" "}
                  {(dailyAdvance + earnings).toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              This will reset the driver&apos;s advance and earnings to zero.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={handleClose}>
            {result !== null ? "Close" : "Cancel"}
          </Button>
          {result === null && (
            <Button
              onClick={handleSettle}
              disabled={isLoading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Settling...
                </>
              ) : (
                <>
                  <Receipt className="mr-2 h-4 w-4" />
                  Settle Account
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
