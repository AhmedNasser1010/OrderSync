"use client";

import { useEffect } from "react"
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/rtk/hooks";
import { reasonDialog, setReasonDialog } from "@/rtk/slices/toggleSlice";
import useOrderHandler from '@/hooks/order-handlers/useOrderHandlers'

export default function ReasonDialog() {
  const t = useTranslations("ReasonDialog");
  const ct = useTranslations("Common");
  const dispatch = useAppDispatch()
  const reasonDialogValue = useAppSelector(reasonDialog);
  const { handleChangeStatus, isCanceling } = useOrderHandler()
  const isCancel = reasonDialogValue.status === "CANCELED"

  useEffect(() => {
    if (reasonDialogValue.isOpen) {
      if (reasonDialogValue.orderId) {
        dispatch(setReasonDialog({ error: null }))
      } else {
        dispatch(setReasonDialog({ error: t("orderIdNotFound") }))
      }
    }
  }, [dispatch, reasonDialogValue.orderId, reasonDialogValue.isOpen, t])

  const handleClose = () => {
    dispatch(setReasonDialog({
      isOpen: false,
      orderId: null,
      status: null,
      reason: null,
      error: null
    }))
  }

  const handleConfirm = () => {
    if (!reasonDialogValue.error && reasonDialogValue.orderId && reasonDialogValue.status) {
      handleChangeStatus(
        reasonDialogValue.orderId,
        reasonDialogValue.status,
        reasonDialogValue.reason ?? undefined,
      )
      handleClose()
    }
  }

  const handleInputChange = (value: string) => {
    dispatch(setReasonDialog({ reason: value === "" ? null : value }))
  }

  return (
    <Dialog open={reasonDialogValue.isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCancel ? t("titleCancel") : t("titleReject")}</DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder={t("reasonPlaceholder")}
            value={reasonDialogValue.reason || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            className="col-span-3"
          />
          {reasonDialogValue.error && (
            <div className="flex items-center text-red-500 text-sm">
              <AlertCircle className="w-4 h-4 ms-2" />
              {reasonDialogValue.error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={reasonDialogValue?.error || isCanceling ? true : false}
          >
            {isCancel ? t("confirmCancel") : t("confirmReject")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="mb-2.5"
          >
            {ct("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
