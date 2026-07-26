import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EyeOff } from "lucide-react";

interface HideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  restaurantName?: string;
}

export function HideDialog({
  open,
  onOpenChange,
  onConfirm,
  restaurantName,
}: HideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
              <EyeOff className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <DialogTitle>Hide Restaurant?</DialogTitle>
              <DialogDescription className="mt-1">
                {restaurantName
                  ? `"${restaurantName}" will be completely hidden from customers and won't appear in the restaurant listings.`
                  : "This restaurant will be completely hidden from customers and won't appear in the restaurant listings."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={onConfirm}>
            Hide Restaurant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
