import Popup from '../../components/Popup'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { setShowItemsAlreadyInCartPopup, setShowResClosedPopup, setShowResPausedPopup } from '../../rtk/slices/toggleSlice'
import { clearCart } from '../../rtk/slices/cartSlice'

const MenuPopups = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const showItemsAlreadyInCartPopup = useSelector(state => state.toggle.showItemsAlreadyInCartPopup)
  const showResClosedPopup = useSelector(state => state.toggle.showResClosedPopup)
  const showResPausedPopup = useSelector(state => state.toggle.showResPausedPopup)

  const handleClearCart = () => {
    dispatch(clearCart())
    dispatch(setShowItemsAlreadyInCartPopup(false))
    toast.success(t('Cart is cleared Successfully'), {
      className: 'font-ProximaNovaSemiBold',
      position: 'top-center',
      duration: 1500
    })
  }

  return (
    <>
      {showItemsAlreadyInCartPopup && (
        <Popup
          title={t('Items already in cart')}
          description={t(
            'Your cart contains items from other restaurant. Would you like to reset your cart for adding items from this restaurant?'
          )}
          visibility={showItemsAlreadyInCartPopup}
          closeCallback={() => dispatch(setShowItemsAlreadyInCartPopup(false))}
          callbackFunc={handleClearCart}
          noLabel={t('NO')}
          yesLabel={t('YES, START AFRESH')}
        />
      )}

      {showResClosedPopup && (
        <Popup
          title={t('Restaurant Is Closed')}
          description={t(
            'This restaurant is currently closed or outside of working hours. Please check back during our regular hours. We appreciate your understanding.'
          )}
          visibility={showResClosedPopup}
          closeCallback={() => dispatch(setShowResClosedPopup(false))}
          callbackFunc={() => navigate('/')}
          noLabel={t('Close')}
          yesLabel={t('All Restaurants')}
        />
      )}

      {showResPausedPopup && (
        <Popup
          title={t('Restaurant Is Paused')}
          description={t(
            "This restaurant is temporarily paused, so we can't take any orders at the moment. We apologize for the inconvenience."
          )}
          visibility={showResPausedPopup}
          closeCallback={() => dispatch(setShowResPausedPopup(false))}
          callbackFunc={() => navigate('/')}
          noLabel={t('Close')}
          yesLabel={t('All Restaurants')}
        />
      )}
    </>
  )
}

export default MenuPopups
