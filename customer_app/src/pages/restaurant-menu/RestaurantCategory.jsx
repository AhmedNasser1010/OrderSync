import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import { addToCart, setRestaurant, clearCart } from '../../rtk/slices/cartSlice'
import priceAfterDiscount from '../../utils/priceAfterDiscount'
import Popup from '../../components/Popup'

const RestaurantCategory = ({
  id,
  resId,
  title,
  ShowItem,
  handleShowItem,
  ResInfoData,
  resAvailability
}) => {
  const { t } = useTranslation()
  const itemCards = []
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const menuItems = useSelector((state) => state.menu.items)
  const currentResId = useSelector((state) => state.cart.restaurant)
  const cartItems = useSelector((state) => state.cart.items)
  const user = useSelector((state) => state.user)
  const [showPopup, setShowPopup] = useState(false)
  const [showResClosedPopup, setShowResClosedPopup] = useState(false)
  const [showResPausedPopup, setShowResPausedPopup] = useState(false)
  const [showCategory, setShowCategory] = useState(true)

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => item.category === id)
  }, [menuItems])

  const handleAccordionBody = () => {
    setShowCategory((showCategory) => !showCategory)
  }

  const handleAddItem = (item) => {
    if (!resAvailability?.availability) {
      setShowResClosedPopup(true)
      return
    }

    if (resAvailability?.temporaryPause) {
      setShowResPausedPopup(true)
      return
    }

    const isItemInCart = cartItems.some((cartItem) => cartItem?.id === item?.id)
    const isSameRes = currentResId === '' ? true : resId === currentResId

    if (isItemInCart) {
      toast.error(t('Already added to the Cart'))
    } else {
      if (isSameRes) {
        toast.success(t('Added to the Cart'))
        dispatch(addToCart({ id: item.id, quantity: 1 }))
        dispatch(setRestaurant(resId))
        setShowPopup(false)
      } else {
        setShowPopup(true)
      }
    }
  }

  const handleClearCart = () => {
    dispatch(clearCart())
    setShowPopup(false)
    toast.success(t('Cart is cleared Successfully'), {
      className: 'font-ProximaNovaSemiBold',
      position: 'top-center',
      duration: 1500
    })
  }

  return (
    <>
      {/* Accordion Header */}
      <div
        className="flex items-center justify-between py-5 px-3 sm:p-6 shadow-md text-left"
        onClick={handleAccordionBody}>
        <h2 className="text-color-9 sm:text-lg font-ProximaNovaBold">
          {title} ({filteredMenuItems?.length})
        </h2>
        <div className="text-xl text-color-9">
          {showCategory ? <IoIosArrowUp /> : <IoIosArrowDown />}
        </div>
      </div>

      {/* Accordion Body */}
      {showCategory && (
        <>
          <div className="accordion-body">
            {filteredMenuItems?.map((item) => {
              const { finalPrice, isAvailableForUser } = item?.discount?.code
                ? priceAfterDiscount(item.price, item.discount, user, ResInfoData.id)
                : { finalPrice: item.price, isAvailableForUser: false }
              const discountIncluded = isAvailableForUser && item.price !== finalPrice
              return (
                <div key={item?.id} className="item flex items-start justify-between pb-8">
                  <div className="md:w-auto w-3/5">
                    {/*<img src='/assets/nonveg.png' alt='non-veg'></img>*/}
                    <img src="/assets/veg.png" alt="veg"></img>
                    <h4
                      className={`text-base ${
                        discountIncluded ? 'text-color-2' : 'text-color-9'
                      } font-ProximaNovaMed`}>
                      {item?.title}
                    </h4>
                    {item?.discount?.message && (
                      <span
                        className={`text-sm font-ProximaNovaMed block ${
                          discountIncluded ? 'text-color-2' : 'text-[#3e4152a1]'
                        } mt-2`}>
                        {item?.discount?.message}
                      </span>
                    )}
                    {discountIncluded ? (
                      <span className="egp text-sm font-ProximaNovaMed text-color-2">{`${item?.price} > ${finalPrice}`}</span>
                    ) : (
                      <span className="egp text-sm font-ProximaNovaMed text-color-9">
                        {item.price}
                      </span>
                    )}
                    {item?.description && (
                      <p className="text-color-10 mt-3 tracking-tight font-ProximaNovaThin text-sm md:w-3/4">
                        {item?.description}
                      </p>
                    )}
                  </div>
                  <div className="relative w-[118px] h-24">
                    {item?.backgrounds[0] && (
                      <button className="cursor-pointer w-[118px] h-24 rounded-md">
                        <img
                          src={item?.backgrounds[0]}
                          alt="menu-img"
                          className="rounded-md w-[118px] h-24 object-cover"
                        />
                      </button>
                    )}
                    <button
                      onClick={() => handleAddItem(item)}
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-[1] w-24 h-9 shadow-md shadow-color-7 bg-white text-center inline-block rounded text-[#60b246] text-sm font-ProximaNovaSemiBold uppercase">
                      Add
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {showPopup && (
            <Popup
              title={t('Items already in cart')}
              description={t(
                'Your cart contains items from other restaurant. Would you like to reset your cart for adding items from this restaurant?'
              )}
              visibility={showPopup}
              closeCallback={() => setShowPopup(false)}
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
              closeCallback={() => setShowResClosedPopup(false)}
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
              closeCallback={() => setShowResPausedPopup(false)}
              callbackFunc={() => navigate('/')}
              noLabel={t('Close')}
              yesLabel={t('All Restaurants')}
            />
          )}
        </>
      )}
    </>
  )
}

export default RestaurantCategory
