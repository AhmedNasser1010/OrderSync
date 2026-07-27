import {
  Popup,
  PopupContent,
  PopupHeader,
  PopupFooter,
  PopupTitle,
  PopupDescription
} from '../popup/Popup.jsx'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import RatingWithComment from '../RatingWithComment'
import {
  useSetOrderFeedbackMutation,
  useSetUserOrderIdToNullMutation,
  useFetchOrderTrackingDataQuery
} from '../../rtk/api/firestoreApi'
import { setRateIsOpen } from '../../rtk/slices/toggleSlice'
import { useTranslation } from 'react-i18next'

function FeedbackPopup() {
  const dispatch = useDispatch()
  const isOpen = useSelector((state) => state.toggle.rateIsOpen)
  const currentOrderId = useSelector((state) => state.user?.trackedOrder?.id)
  const user = useSelector((state) => state.user)
  const { data: trackedOrderData } = useFetchOrderTrackingDataQuery({
    resId: user?.trackedOrder?.restaurant,
    orderId: user?.trackedOrder?.id,
    uid: user?.uid
  })
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [setOrderFeedbackMutation] = useSetOrderFeedbackMutation()
  const [setUserOrderIdToNull] = useSetUserOrderIdToNullMutation()
  const { t } = useTranslation()

  const resetFeedbackForm = () => {
    setRating(0)
    setComment('')
  }

  const handleSubmit = () => {
    if ((rating <= 5 && rating >= 0) || comment) {
      const uid = user?.uid
      const resId = user?.trackedOrder?.restaurant
      setOrderFeedbackMutation({ orderId: trackedOrderData?.id, uid, feedback: { rating, comment }, resId })
    }
    if (user?.uid) {
      setUserOrderIdToNull(user.uid)
    }
    dispatch(setRateIsOpen(false))
    resetFeedbackForm()
  }

  const handleClose = () => {
    if (user?.uid) {
      setUserOrderIdToNull(user.uid)
    }
    dispatch(setRateIsOpen(false))
    resetFeedbackForm()
  }

  useEffect(() => {
    if (!isOpen) {
      resetFeedbackForm()
    }
  }, [isOpen])

  return (
    isOpen && (
      <Popup>
        <PopupContent>
          <PopupHeader closePopupCallback={handleClose}>
            <PopupTitle>{t('Rate this Restaurant!')}</PopupTitle>
            <PopupDescription>
              {t('We appreciate your feedback and will use it to improve our services.')}
            </PopupDescription>
          </PopupHeader>

          <RatingWithComment
            rating={rating}
            setRating={setRating}
            comment={comment}
            setComment={setComment}
          />

          <PopupFooter>
            <button className="px-4 py-2 bg-color-2 text-white" onClick={handleSubmit}>
              {t('Submit Feedback')}
            </button>
          </PopupFooter>
        </PopupContent>
      </Popup>
    )
  )
}

export default FeedbackPopup
