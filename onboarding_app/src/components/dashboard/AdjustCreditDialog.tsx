"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdjustCustomerCreditMutation } from "@/rtk/api/firestoreApi";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { CustomerType, WalletTransaction } from "@ordersync/types";

interface AdjustCreditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerType | null;
  balance: number;
  transactions: WalletTransaction[];
  onAdjusted: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  GRANT: "Grant",
  REDEEM: "Redeem",
  EXPIRE: "Expire",
  CLAWBACK: "Clawback",
  ADMIN_ADJUST: "Manual",
};

const TYPE_COLOR: Record<string, string> = {
  GRANT: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400",
  REDEEM: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400",
  EXPIRE: "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400",
  CLAWBACK: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
  ADMIN_ADJUST: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-400",
};

export function AdjustCreditDialog({
  open,
  onOpenChange,
  customer,
  balance,
  transactions,
  onAdjusted,
}: AdjustCreditDialogProps) {
  const { user } = useAuth();
  const [adjustCustomerCredit, { isLoading: isAdjusting }] =
    useAdjustCustomerCreditMutation();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState<"grant" | "revoke">("grant");
  const [error, setError] = useState<string | null>(null);

  const name =
    customer?.userInfo?.name ||
    customer?.userInfo?.email?.split("@")[0] ||
    "This customer";

  const reset = () => {
    setAmount("");
    setReason("");
    setMode("grant");
    setError(null);
  };

  const handleSubmit = async () => {
    if (!customer || !user) return;
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setError("Enter a positive credit amount.");
      return;
    }
    if (!reason.trim()) {
      setError("A reason is required for the audit trail.");
      return;
    }
    setError(null);
    try {
      const idToken = await user.getIdToken();
      await adjustCustomerCredit({
        targetUserId: customer.uid,
        amount: mode === "grant" ? numeric : -numeric,
        reason: reason.trim(),
        idToken,
      }).unwrap();
      reset();
      onAdjusted();
      onOpenChange(false);
    } catch (err) {
      const code =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data?: string }).data
          : undefined;
      if (code === "REASON_REQUIRED") {
        setError("A reason is required.");
      } else if (code === "FORBIDDEN") {
        setError("You do not have permission.");
      } else {
        setError("Failed to adjust credits.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0">
              <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <DialogTitle>Adjust Cash Back — {name}</DialogTitle>
              <DialogDescription className="mt-1">
                Current balance:{" "}
                <span className="font-semibold text-emerald-600">
                  {balance} EGP
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2 flex flex-wrap gap-2">
          {(["grant", "revoke"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setAmount("");
              }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                mode === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/70"
              )}
            >
              {m === "grant" ? "Add credit" : "Revoke credit"}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="adjust-amount">Amount (EGP)</Label>
          <Input
            id="adjust-amount"
            type="number"
            step="1"
            min="0"
            placeholder="e.g. 50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="adjust-reason">
            Reason <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="adjust-reason"
            placeholder="e.g. Customer service compensation for delayed order"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Recent activity</Label>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-lg border border-border p-2">
            {transactions.length === 0 ? (
              <p className="text-xs text-muted-foreground px-2 py-1">
                No wallet activity yet.
              </p>
            ) : (
              transactions.slice(0, 20).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-2 text-xs px-2 py-1"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-1.5 py-0 text-[10px]",
                        TYPE_COLOR[tx.type] ?? ""
                      )}
                    >
                      {TYPE_LABEL[tx.type] ?? tx.type}
                    </Badge>
                    <div className="min-w-0">
                      {tx.reason && <p className="truncate">{tx.reason}</p>}
                      <p className="text-[10px] text-muted-foreground truncate">
                        {format(new Date(tx.createdAt), "dd/MM/yyyy hh:mm a")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "font-semibold",
                      tx.amount >= 0 ? "text-emerald-600" : "text-red-600"
                    )}
                  >
                    {tx.amount >= 0 ? "+" : ""}
                    {tx.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isAdjusting || !amount || !reason.trim()}
          >
            {isAdjusting ? "Saving..." : "Apply credit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
