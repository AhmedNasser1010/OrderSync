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

interface HideReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  hidden: boolean;
  customerName?: string;
  restaurantName?: string;
}

export function HideReviewDialog({
  open,
  onOpenChange,
  onConfirm,
  hidden,
  customerName,
  restaurantName,
}: HideReviewDialogProps) {
  const isHidden = hidden;
  const subject = [
    customerName ? `"${customerName}"'s review` : "This review",
    restaurantName ? `for "${restaurantName}"` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
              {isHidden ? (
                <Eye className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <EyeOff className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              )}
            </div>
            <div>
              <DialogTitle>
                {isHidden ? "Show Review?" : "Hide Review?"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {isHidden
                  ? `${subject} will be made visible again to customers and will count toward the restaurant's rating.`
                  : `${subject} will be hidden from customers and will no longer count toward the restaurant's rating.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <ButtonGuard variant="secondary" onClick={onConfirm}>
            {isHidden ? "Show Review" : "Hide Review"}
          </ButtonGuard>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
