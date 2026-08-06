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
import { Eye, EyeOff } from "lucide-react";

interface HideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  restaurantName?: string;
  hiding: boolean;
}

export function HideDialog({
  open,
  onOpenChange,
  onConfirm,
  restaurantName,
  hiding,
}: HideDialogProps) {
  const subject = restaurantName ? `"${restaurantName}"` : "This restaurant";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
              {hiding ? (
                <EyeOff className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <Eye className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              )}
            </div>
            <div>
              <DialogTitle>
                {hiding ? "Hide Restaurant?" : "Show Restaurant?"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {hiding
                  ? `${subject} will be completely hidden from customers and won't appear in the restaurant listings.`
                  : `${subject} will be shown again to customers and will appear in the restaurant listings.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <ButtonGuard variant="secondary" onClick={onConfirm}>
            {hiding ? "Hide Restaurant" : "Show Restaurant"}
          </ButtonGuard>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
