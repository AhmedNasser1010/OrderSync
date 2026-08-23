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
import { ButtonGuard } from "@/components/ui/button-guard";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Ban, UserCheck } from "lucide-react";

interface SuspendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "ban" | "unban";
  customerName?: string;
  initialReason?: string;
  onBan: (reason: string) => void;
  onUnban: () => void;
  onSaveNote: (reason: string) => void;
}

export function SuspendDialog({
  open,
  onOpenChange,
  mode,
  customerName,
  initialReason,
  onBan,
  onUnban,
  onSaveNote,
}: SuspendDialogProps) {
  const [reason, setReason] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    setReason(open ? (initialReason ?? "") : "");
  }

  const subject = customerName ? `"${customerName}"` : "This customer";
  const isBanning = mode === "ban";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                isBanning
                  ? "bg-red-100 dark:bg-red-950/50"
                  : "bg-green-100 dark:bg-green-950/50",
              )}
            >
              {isBanning ? (
                <Ban className="h-5 w-5 text-red-600 dark:text-red-400" />
              ) : (
                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              )}
            </div>
            <div>
              <DialogTitle>
                {isBanning ? "Ban Customer?" : "Edit Ban Reason"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {isBanning
                  ? `${subject} will no longer be able to place orders. Add an internal note explaining why — visible only to onboarding users.`
                  : `${subject} is currently banned. Update the internal note or unban them to allow ordering again.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4 space-y-2">
          <Label htmlFor="suspend-reason">
            Reason <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="suspend-reason"
            placeholder="e.g. Repeated fake orders"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {isBanning ? (
            <ButtonGuard
              variant="destructive"
              disabled={!reason.trim()}
              onClick={() => onBan(reason.trim())}
            >
              Ban Customer
            </ButtonGuard>
          ) : (
            <>
              <ButtonGuard
                variant="secondary"
                disabled={!reason.trim()}
                onClick={() => onSaveNote(reason.trim())}
              >
                Save Note
              </ButtonGuard>
              <ButtonGuard variant="destructive" onClick={onUnban}>
                Unban Customer
              </ButtonGuard>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
