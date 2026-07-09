"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("Auth.unassigned");

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="text-center">{t("title")}</DialogTitle>
          <DialogDescription className="text-center pt-2">
            {t("description")}
            <br />
            {t("signedInAs")} <strong>{email}</strong>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button
            variant="destructive"
            onClick={onLogout}
            className="w-full sm:w-auto"
          >
            {t("logout")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
