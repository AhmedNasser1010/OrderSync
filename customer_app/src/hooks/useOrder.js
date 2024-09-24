import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  useFetchOrderTrackingDataQuery,
  useCancelOrderMutation,
  useSetOrderFeedbackMutation,
  useSetUserOrderIdToNullMutation
} from '../rtk/api/firestoreApi'
import { setRateIsOpen } from '../rtk/slices/toggleSlice'

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

  // On Completed Scenario
  useEffect(() => {
    if (trackedOrderData && trackedOrderData?.status?.current === "COMPLETED") {
      console.log("On Completed Scenario")
      dispatch(setRateIsOpen(true))
    }
  }, [trackedOrderData])

  // On Cancellation Scenario
  useEffect(() => {
    if (trackedOrderData && trackedOrderData?.status?.current === "CANCELED") {
      console.log("On Cancellation Scenario")
    }
  }, [trackedOrderData])

  // On No Order Data Scenario
  useEffect(() => {
    if (
      hasOrder === false &&
      user.trackedOrder?.id
    ) {
      console.log("On No Order Data Scenario")
      setUserOrderIdToNull(user?.uid)
    }
  }, [trackedOrderData, hasOrder])


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
