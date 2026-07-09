"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CircleHelp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface WidgetHelpProps {
  widgetKey: string;
}

export function WidgetHelp({ widgetKey }: WidgetHelpProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Dashboard.widgetHelp");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <CircleHelp className="w-3.5 h-3.5" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(`${widgetKey}.title`)}</DialogTitle>
            <DialogDescription>{t(`${widgetKey}.description`)}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
