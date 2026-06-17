import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Popup,
  PopupContent,
  PopupHeader,
  PopupFooter,
  PopupTitle,
  PopupDescription
} from '../popup/Popup.jsx'
import { clearCart } from '../../rtk/slices/cartSlice'
import { setShowRestaurantUnavailablePopup } from '../../rtk/slices/toggleSlice'
import { initRestaurants } from '../../rtk/slices/restaurantsSlice'
import DB_GET_COLLECTION from '../../utils/DB_GET_COLLECTION'

function RestaurantUnavailablePopup() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isOpen = useSelector((state) => state.toggle.showRestaurantUnavailablePopup)

  const refreshRestaurants = async () => {
    const restaurants = await DB_GET_COLLECTION('businesses')
    if (Array.isArray(restaurants)) {
      dispatch(initRestaurants(restaurants))
    }
  }

  const handleGoHome = async () => {
    await refreshRestaurants()
    dispatch(clearCart())
    dispatch(setShowRestaurantUnavailablePopup(false))
    navigate('/')
  }

  const handleClose = async () => {
    await refreshRestaurants()
    dispatch(setShowRestaurantUnavailablePopup(false))
  }

  return (
    isOpen && (
      <Popup>
        <PopupContent>
          <PopupHeader closePopupCallback={handleClose}>
            <PopupTitle>{t('Restaurant Is Closed')}</PopupTitle>
            <PopupDescription>
              {t('This restaurant is closed or paused right now. Please remove the items from your cart and return to the main page.')}
            </PopupDescription>
          </PopupHeader>

          <PopupFooter>
            <button className="px-4 py-2 bg-color-2 text-white" onClick={handleGoHome}>
              {t('Remove Cart Items and Go Home')}
            </button>
          </PopupFooter>
        </PopupContent>
      </Popup>
    )
  )
}

export default RestaurantUnavailablePopup
