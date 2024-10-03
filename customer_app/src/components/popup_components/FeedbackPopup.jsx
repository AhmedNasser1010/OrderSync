import {
  Popup,
  PopupContent,
  PopupHeader,
  PopupFooter,
  PopupTitle,
  PopupDescription
} from '../popup/Popup.jsx'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setRateIsOpen } from '../../rtk/slices/toggleSlice'
import RatingWithComment from '../RatingWithComment'
import useOrder from '../../hooks/useOrder'
import { useTranslation } from 'react-i18next'

function FeedbackPopup() {
  const dispatch = useDispatch()
  const isOpen = useSelector((state) => state.toggle.rateIsOpen)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const { setOrderFeedback } = useOrder()
  const { t } = useTranslation()

  const handleSubmit = () => {
    setOrderFeedback({ rating, comment })
    dispatch(setRateIsOpen(false))
  }

  return (
    isOpen && (
      <Popup>
        <PopupContent>
          <PopupHeader closePopupCallback={() => dispatch(setRateIsOpen(false))}>
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
