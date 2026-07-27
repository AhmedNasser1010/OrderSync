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
import { deletePopup } from "@/rtk/slices/toggleSlice";
import { setDeletePopup } from "@/rtk/slices/toggleSlice";
import useOrderHandler from '@/hooks/order-handlers/useOrderHandlers'

export default function DeleteOrderPopup() {
  const t = useTranslations("DeleteOrder");
  const ct = useTranslations("Common");
  const dispatch = useAppDispatch()
  const deletePopupValue = useAppSelector(deletePopup);
  const { deleteOrder } = useOrderHandler()

  useEffect(() => {
    if (deletePopupValue.isOpen) {
      if (deletePopupValue.orderId) {
        dispatch(setDeletePopup({ error: null }))
      } else {
        dispatch(setDeletePopup({ error: t("orderIdNotFound") }))
      }
    }
  }, [dispatch, deletePopupValue.orderId, deletePopupValue.isOpen, t])

  const handleClose = () => {
    dispatch(setDeletePopup({
      isOpen: false,
      orderId: null,
      cancellationReason: null,
      error: null
    }))
  }

  const handleDelete = () => {
    if (!deletePopupValue.error) {
      deleteOrder.handleDeleteOrder(deletePopupValue.orderId)
      handleClose()
    }
  }

  const handleInputChange = (value: string) => {
    if (value === '') {
      dispatch(setDeletePopup({ cancellationReason: null }))
    } else {
      dispatch(setDeletePopup({ cancellationReason: value }))
    }
  }

  return (
    <Dialog open={deletePopupValue.isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder={t("reasonPlaceholder")}
            value={deletePopupValue.cancellationReason || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            className="col-span-3"
          />
          {deletePopupValue.error && (
            <div className="flex items-center text-red-500 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {deletePopupValue.error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deletePopupValue?.error || deleteOrder.isLoading ? true : false}
          >
            {t("button")}
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
