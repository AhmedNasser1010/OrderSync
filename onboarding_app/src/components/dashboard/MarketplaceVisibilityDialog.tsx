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
import { Globe, GlobeOff } from "lucide-react";

interface MarketplaceVisibilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  restaurantName?: string;
  hiding: boolean;
}

export function MarketplaceVisibilityDialog({
  open,
  onOpenChange,
  onConfirm,
  restaurantName,
  hiding,
}: MarketplaceVisibilityDialogProps) {
  const subject = restaurantName ? `"${restaurantName}"` : "This restaurant";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              {hiding ? (
                <GlobeOff className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              ) : (
                <Globe className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              )}
            </div>
            <div>
              <DialogTitle>
                {hiding ? "Hide from Marketplace?" : "Show in Marketplace?"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {hiding
                  ? `${subject} will be hidden from the driver marketplace. Drivers won't see this restaurant's orders.`
                  : `${subject} will be visible in the driver marketplace again.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <ButtonGuard variant="secondary" onClick={onConfirm}>
            {hiding ? "Hide from Marketplace" : "Show in Marketplace"}
          </ButtonGuard>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
