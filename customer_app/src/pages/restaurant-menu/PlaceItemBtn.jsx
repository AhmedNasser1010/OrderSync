import {
  setShowItemsAlreadyInCartPopup,
  setShowResClosedPopup,
  setShowResPausedPopup
} from '../../rtk/slices/toggleSlice'
import { addToCart, setRestaurant } from '../../rtk/slices/cartSlice'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const PlaceItemBtn = ({ item, resAvailability, resID }) => {
  const { t } = useTranslation()
  const { i18n } = useTranslation()
  const lang = i18n?.language || 'ar'
  const dispatch = useDispatch()
  const cartItems = useSelector((state) => state.cart.items)
  const currentResId = useSelector((state) => state.cart.restaurant)

  const menuItems = useSelector((state) => state.menu.items)

  const handleAddItem = (item) => {
    if (!resAvailability?.availability) {
      dispatch(setShowResClosedPopup(true))
      return
    }

    if (resAvailability?.temporaryPause) {
      dispatch(setShowResPausedPopup(true))
      return
    }

    const itemFromCart = menuItems.find((menuItem) => menuItem.id === item.id)

    const menuItem = {
      ...itemFromCart,
      selectedSize:
        itemFromCart?.selectedSize ||
        (item?.sizes?.length && item?.sizes[1]?.price && item?.sizes[1]) ||
        (item?.sizes[0]?.price && item?.sizes[0]) ||
        (item?.sizes[2]?.price && item?.sizes[2]) ||
        null
    }

    const isItemInCart = cartItems.some(
      (cartItem) =>
        cartItem?.id === menuItem?.id &&
        (cartItem?.selectedSize === null || cartItem?.selectedSize === menuItem?.selectedSize?.size)
    )

    const isSameRes = currentResId === '' ? true : resID === currentResId

    if (isItemInCart) {
      toast.error(t('Already added to the Cart'))
    } else {
      if (isSameRes) {
        toast.success(t('Added to the Cart'))
        dispatch(
          addToCart({ id: menuItem.id, quantity: 1, selectedSize: menuItem?.selectedSize?.size || null })
        )
        dispatch(setRestaurant(resID))
        dispatch(setShowItemsAlreadyInCartPopup(false))
      } else {
        dispatch(setShowItemsAlreadyInCartPopup(true))
      }
    }
  }

  return (
    <button
      onClick={() => handleAddItem(item)}
      className={`absolute -bottom-2 left-1/2 -translate-x-1/2 z-[1] w-24 h-9 shadow-md shadow-color-7 bg-white text-center inline-block rounded text-[#60b246] text-sm ${
        lang === 'ar' ? 'font-Cairo font-bold' : 'font-ProximaNovaSemiBold'
      } uppercase`}>
      {t('Add')}
    </button>
  )
}

export default PlaceItemBtn
