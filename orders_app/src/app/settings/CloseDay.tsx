"use client";

import { useTranslations } from "next-intl";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/rtk/hooks";
import { setCloseDayPopup } from "@/rtk/slices/toggleSlice";

export default function CloseDay() {
  const t = useTranslations("Settings.closeDay");
  const dispatch = useAppDispatch();

  return (
    <section className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 text-red-500 shrink-0">
          <KeyRound className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground">{t("title")}</h2>
          <p className="text-xs text-muted-foreground">{t("description")}</p>
        </div>
      </div>
      <div className="px-4 pb-4 pt-2">
        <Button
          variant="outline"
          className="w-full justify-between border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600"
          onClick={() => dispatch(setCloseDayPopup({ isOpen: true }))}
        >
          <span>{t("button")}</span>
          <KeyRound className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
