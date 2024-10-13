import { useMemo } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, ShieldCheck, Loader2 } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/rtk/hooks";
import { closeDayPopup, setCloseDayPopup } from "@/lib/rtk/slices/toggleSlice";
import useCloseDay from '@/hooks/useCloseDay'

export default function CloseDayPopup() {
  const dispatch = useAppDispatch()
  const closeDayPopupValues = useAppSelector(closeDayPopup);
  const { closeDay, isPassed, isLoading } = useCloseDay()
  const ordersIsPassed = isPassed()

  const handleClose = () => {
    dispatch(setCloseDayPopup({
      isOpen: false,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Day</DialogTitle>
          <DialogDescription>
            Confirm close day action.
          </DialogDescription>
        </DialogHeader>
          <div className="flex flex-col items-center justify-center my-5">
            {isLoading &&
              <div className="flex items-center text-sm md-2.5">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </div>
            }
            {!closeDayPopupValues?.errors?.noQueue.isPassed &&
              <div className="flex items-center text-red-500 text-sm md-2.5">
                <AlertCircle className="w-4 h-4 mr-2" />
                {closeDayPopupValues?.errors?.noQueue.text}
              </div>
            }
            {!closeDayPopupValues?.errors?.hasCompletedOrders.isPassed &&
              <div className="flex items-center text-red-500 text-sm md-2.5">
                <AlertCircle className="w-4 h-4 mr-2" />
                {closeDayPopupValues?.errors?.hasCompletedOrders.text}
              </div>
            }
            {ordersIsPassed &&
              <div className="flex items-center text-green-500 text-sm md-2.5">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Everything is passed, you can confirm now!
              </div>
            }
          </div>
        <DialogFooter>
          <Button
            type="button"
            variant={ordersIsPassed ? "success" : "destructive"}
            onClick={closeDay}
            disabled={!ordersIsPassed}
          >
            Confirm
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