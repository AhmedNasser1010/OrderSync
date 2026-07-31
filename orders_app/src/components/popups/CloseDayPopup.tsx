"use client";

import { useEffect } from 'react'
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { KeyRound, AlertCircle, ShieldCheck, Loader2 } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/rtk/hooks";
import { closeDayPopup, setCloseDayPopup } from "@/rtk/slices/toggleSlice";
import useCloseDay from '@/hooks/useCloseDay'

export default function CloseDayPopup() {
  const t = useTranslations("Settings.closeDay");
  const ct = useTranslations("Common");
  const dispatch = useAppDispatch()
  const closeDayPopupValues = useAppSelector(closeDayPopup);
  const { closeDay, isPassed, isLoading } = useCloseDay()
  const ordersIsPassed = isPassed()

  useEffect(() => {
    if (closeDayPopupValues.result.type === "success") {
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [closeDayPopupValues.result.type]);

  const handleClose = () => {
    dispatch(setCloseDayPopup({
      isOpen: false,
      isLoading: true,
      result: {
        type: null,
        text: ""
      },
      errors: {
        noQueue: {
          isPassed: false,
          text: ""
        },
        hasCompletedOrders: {
          isPassed: false,
          text: ""
        }
      }
     }))
  }

  return (
    <Dialog open={closeDayPopupValues.isOpen} onOpenChange={handleClose}>
      <DialogContent className="rounded-2xl border border-border">
        <DialogHeader className="items-center text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 text-red-500 mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-semibold">{t("popupTitle")}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("popupDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 my-2">
          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              <span>{t("checking")}</span>
            </div>
          )}
          {!closeDayPopupValues?.errors?.noQueue.isPassed && !isLoading && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 text-sm text-red-500">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{closeDayPopupValues?.errors?.noQueue.text || t("hasActiveOrders")}</span>
            </div>
          )}
          {!closeDayPopupValues?.errors?.hasCompletedOrders.isPassed && !isLoading && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 text-sm text-red-500">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{closeDayPopupValues?.errors?.hasCompletedOrders.text}</span>
            </div>
          )}
          {ordersIsPassed && !isLoading && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-500/10 text-sm text-green-600 dark:text-green-500">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>{t("allPassed")}</span>
            </div>
          )}
          {closeDayPopupValues.result.type === "success" && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-500/10 text-sm text-green-600 dark:text-green-500">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>{t("success")}</span>
            </div>
          )}
          {closeDayPopupValues.result.type === "error" && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 text-sm text-red-500">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{closeDayPopupValues.result.text || t("failed")}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            {ct("cancel")}
          </Button>
          <Button
            type="button"
            variant={ordersIsPassed ? "default" : "destructive"}
            onClick={closeDay}
            disabled={!ordersIsPassed || isLoading || closeDayPopupValues.result.type === "success"}
            className="w-full sm:w-auto"
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
