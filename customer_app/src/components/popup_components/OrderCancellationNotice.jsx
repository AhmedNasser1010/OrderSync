import {
  Popup,
  PopupContent,
  PopupHeader,
  PopupFooter,
  PopupTitle,
  PopupDescription
} from '../popup/Popup.jsx'
import { useDispatch, useSelector } from 'react-redux'
import { setCancellationNoticeIsOpen } from '../../rtk/slices/toggleSlice.js'
import useOrder from '../../hooks/useOrder'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

function OrderCancellationNotice() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isOpen = useSelector((state) => state.toggle.cancellationNoticeIsOpen)
  const { trackedOrderData } = useOrder()
  const [cancellationReason, setCancellationReason] = useState('')
  const { t } = useTranslation()

  useEffect(() => {
    if (trackedOrderData?.status?.cancellationReason) {
      setCancellationReason(trackedOrderData?.status?.cancellationReason)
    }
  }, [trackedOrderData?.status?.cancellationReason])

  const handleClick = () => {
    dispatch(setCancellationNoticeIsOpen(false))
    navigate('/')
  }

  return (
    isOpen && (
      <Popup>
        <PopupContent>
          <PopupHeader closePopupCallback={handleClick}>
            <PopupTitle>{t('Your Order Has Been Canceled!')}</PopupTitle>
            <PopupDescription>
              {cancellationReason ||
                t('Sorry, your order was canceled due to an issue in the kitchen. We apologize for the inconvenience.')}
            </PopupDescription>
          </PopupHeader>

          <PopupFooter>
            <button className="px-4 py-2 bg-color-2 text-white" onClick={handleClick}>
              {t('Browse Other Restaurants')}
            </button>
          </PopupFooter>
        </PopupContent>
      </Popup>
    )
  )
}

export default OrderCancellationNotice
