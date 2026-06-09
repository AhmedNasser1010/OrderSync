import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  useFetchOrderTrackingDataQuery,
  useCancelOrderMutation,
  useSetOrderFeedbackMutation,
  useSetUserOrderIdToNullMutation,
  useFinalizePendingLoyaltyMutation
} from '../rtk/api/firestoreApi'
import { setRateIsOpen, setCancellationNoticeIsOpen } from '../rtk/slices/toggleSlice'
import { clearCart } from '../rtk/slices/cartSlice'

const useOrder = () => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)
  const { data: trackedOrderData } = useFetchOrderTrackingDataQuery({
    resId: user?.trackedOrder?.restaurant,
    orderId: user?.trackedOrder?.id,
    uid: user?.uid
  })
  const hasOrder = useSelector((state) => state.toggle.hasOrder)
  const [cancelOrderMutation] = useCancelOrderMutation()
  const [setOrderFeedbackMutation] = useSetOrderFeedbackMutation()
  const [setUserOrderIdToNull] = useSetUserOrderIdToNullMutation()
  const [finalizePendingLoyalty] = useFinalizePendingLoyaltyMutation()
  const loyaltyMarkAttemptRef = useRef(null)

  // On Completed Scenario
  useEffect(() => {
    if (trackedOrderData && trackedOrderData?.status?.current === 'DELIVERED') {
      const orderId = user?.trackedOrder?.id
      dispatch(clearCart())

      if (orderId && loyaltyMarkAttemptRef.current !== orderId) {
        loyaltyMarkAttemptRef.current = orderId
        finalizePendingLoyalty({
          uid: user?.uid,
          orderId
        }).then(() => {
          loyaltyMarkAttemptRef.current = null
        })
      }

      dispatch(setRateIsOpen(true))
    } else {
      loyaltyMarkAttemptRef.current = null
    }
  }, [trackedOrderData, user])

  // On Cancellation Scenario
  useEffect(() => {
    if (trackedOrderData && trackedOrderData?.status?.current === 'CANCELED') {
      console.log('Order Canceled')
      dispatch(clearCart())
      dispatch(setCancellationNoticeIsOpen(true))
      setUserOrderIdToNull(user?.uid)
    }
  }, [trackedOrderData])

  // On No Order Data Scenario
  useEffect(() => {
    const pendingLoyalty = user?.trackedOrder?.pendingLoyalty
    const orderId = pendingLoyalty?.orderId

    if (hasOrder === false && orderId) {
      if (loyaltyMarkAttemptRef.current !== orderId) {
        loyaltyMarkAttemptRef.current = orderId
        dispatch(clearCart())
        finalizePendingLoyalty({
          uid: user?.uid,
          orderId
        }).finally(() => {
          loyaltyMarkAttemptRef.current = null
        })
      }
      return
    }

    if (hasOrder === false && user.trackedOrder?.id && !pendingLoyalty) {
      setUserOrderIdToNull(user?.uid)
    }
  }, [dispatch, finalizePendingLoyalty, hasOrder, user])

  const cancelOrder = () => {
    if (trackedOrderData?.status?.current === 'RECEIVED') {
      cancelOrderMutation({
        resId: user?.trackedOrder?.restaurant,
        orderData: trackedOrderData,
        uid: user?.uid
      })
    }
  }

  const setOrderFeedback = (feedback) => {
    if ((feedback.rating <= 5 && feedback.rating >= 0) || feedback.comment) {
      const uid = user.uid
      const orderData = trackedOrderData
      console.log('const orderData = trackedOrderData')
      console.log(trackedOrderData)
      setOrderFeedbackMutation({ orderData, uid, feedback })
    }
  }

  return {
    cancelOrder,
    trackedOrderData,
    setOrderFeedback
  }
}

export default useOrder
