import { useEffect } from "react"
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
  const dispatch = useAppDispatch()
  const deletePopupValue = useAppSelector(deletePopup);
  const { deleteOrder } = useOrderHandler()

  useEffect(() => {
    if (deletePopupValue.isOpen) {
      if (deletePopupValue.orderId) {
        dispatch(setDeletePopup({ error: null }))
      } else {
        dispatch(setDeletePopup({ error: 'Order Id Not Found' }))
      }
    }
  }, [dispatch, deletePopupValue.orderId, deletePopupValue.isOpen])

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
      deleteOrder.handleDeleteOrder(deletePopupValue.orderId, deletePopupValue.cancellationReason)
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
          <DialogTitle>Delete Order</DialogTitle>
          <DialogDescription>
            Please provide a reason for deleting the order or leave it empty and click delete.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Type the reason of delete"
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
            Delete Order
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="mb-2.5"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}