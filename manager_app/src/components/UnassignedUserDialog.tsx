"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UnassignedUserDialogProps {
  open: boolean;
  email: string;
  onLogout: () => void;
}

export default function UnassignedUserDialog({
  open,
  email,
  onLogout,
}: UnassignedUserDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="text-center">Access Restricted</DialogTitle>
          <DialogDescription className="text-center pt-2">
            You aren't assigned to any businesses yet
            <br />
            Signed in as <strong>{email}</strong>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button
            variant="destructive"
            onClick={onLogout}
            className="w-full sm:w-auto"
          >
            Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
