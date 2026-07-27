"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { MainTabTypes } from "@/types/orders";
import { Printer } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";

export default function InvoiceDialogTrigger({
  activeTabValue,
}: {
  activeTabValue: MainTabTypes;
}) {
  const ct = useTranslations("Common");

  return (
    activeTabValue !== "RECEIVED" && (
      <DialogTrigger asChild className="disabled-click-1">
        <Button
          variant="outline"
          size="sm"
          className="disabled-click-1 flex items-center"
        >
          <Printer className="mr-2 h-4 w-4" />
          {ct("printInvoice")}
        </Button>
      </DialogTrigger>
    )
  );
}
