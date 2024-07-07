import { useState, useMemo } from "react"
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io"
import { useDispatch, useSelector } from 'react-redux'
import toast, { Toaster } from 'react-hot-toast'
import { addToCart, setRestaurant, clearCart } from '../rtk/slices/cartSlice'
import { useTranslation } from 'react-i18next'

import priceAfterDiscount from '../utils/priceAfterDiscount'

const RestaurantCategory = ({ id, resId, title, ShowItem, handleShowItem, ResInfoData }) => {
  const { t } = useTranslation()
  const itemCards = []
  const dispatch = useDispatch()
  const menuItems = useSelector(state => state.menu.items)
  const currentResId = useSelector(state => state.cart.restaurant)
  const cartItems = useSelector(state => state.cart.items)
  const [ShowPopup, setShowPopup] = useState(false)

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => item.category === id)
  }, [menuItems])

  const handleAccordionBody = () => {
    handleShowItem()
  }

  const handleAddItem = (item) => {
    const isItemInCart = cartItems.some(cartItem => cartItem?.id === item?.id)
    const isSameRes = currentResId === '' ? true : resId === currentResId

      if(isItemInCart){
        toast.error(t('Already added to the Cart'));
      }
      else{
        if(isSameRes){
          toast.success(t('Added to the Cart'));
          dispatch(addToCart({ id: item.id, quantity: 1 }))
          dispatch(setRestaurant(resId))
          setShowPopup(false)
        }
        else{
          setShowPopup(true)
        }
      }
  }

  const handleClearCart = () => {
    dispatch(clearCart())
    setShowPopup(false)
    toast.success(t('Cart is cleared Successfully'), {
      className: "font-ProximaNovaSemiBold",
      position: "top-center",
      duration: 1500
    })
  }

  return (
    <>
      {/* Accordion Header */}
      <div className='flex items-center justify-between py-5 px-3 sm:p-6 shadow-md text-left' onClick={handleAccordionBody}>
        <h2 className='text-color-9 sm:text-lg font-ProximaNovaBold'>{title} ({filteredMenuItems?.length})</h2>
        <div className='text-xl text-color-9'>
          {
            ShowItem ? <IoIosArrowUp /> : <IoIosArrowDown />
          }
        </div>
      </div>

      {/* Accordion Body */}
      {
        ShowItem &&
        <>
          <div className='accordion-body'>
            {
              filteredMenuItems?.map(item => (
                <div key={item?.id} className='item flex items-start justify-between pb-8'>
                  <div className='md:w-auto w-3/5'>
                    {/*<img src='/assets/nonveg.png' alt='non-veg'></img>*/}
                    <img src='/assets/veg.png' alt='veg'></img>
                    <h4 className='text-base text-color-9 font-ProximaNovaMed'>{item?.title}</h4>
                    {
                      item?.price ? <span className={`egp text-sm font-ProximaNovaMed ${item?.discount?.code ? 'text-color-2' : 'text-color-9'}`}>{item?.discount?.code ? `${item?.price} > ${priceAfterDiscount(item?.price, item?.discount?.code)}` : item?.price}</span> : <span className='egp text-color-9 text-sm font-ProximaNovaMed'>??</span>
                    }
                    {
                      item?.discount?.message && <span className='text-sm font-ProximaNovaMed block text-color-2 mt-2'>{ item?.discount?.message }</span>
                    }
                    {
                      item?.description && <p className='text-color-10 mt-3 tracking-tight font-ProximaNovaThin text-sm md:w-3/4'>{item?.description}</p>
                    }
                  </div>
                  <div className='relative w-[118px] h-24'>
                    {
                      item?.backgrounds[0] && <button className='cursor-pointer w-[118px] h-24 rounded-md'>
                        <img src={item?.backgrounds[0]} alt="menu-img" className='rounded-md w-[118px] h-24 object-cover' />
                      </button>
                    }
                    <button onClick={() => handleAddItem(item)} className='absolute -bottom-2 left-1/2 -translate-x-1/2 z-[1] w-24 h-9 shadow-md shadow-color-7 bg-white text-center inline-block rounded text-[#60b246] text-sm font-ProximaNovaSemiBold uppercase'>Add</button>
                  </div>
                </div>
              ))
            }
          </div>

          {
            ShowPopup &&
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 -translate-y-1/3 p-5 bg-white flex flex-col w-full max-w-[500px] h-52 shadow-md popup-anim z-10">
              <h3 className='font-ProximaNovaSemiBold text-xl'>Items already in cart</h3>
              <p className='text-color-3 font-ProximaNovaThin text-sm py-2'>
                Your cart contains items from other restaurant. Would you
                like to reset your cart for adding items from this
                restaurant?
              </p>
              <div className='flex justify-between sm:justify-center font-ProximaNovaSemiBold sm:text-sm text-xs sm:gap-0 gap-6'>
                <button onClick={() => setShowPopup(false)} className='bg-white border border-color-11 sm:w-2/5 w-40 sm:h-14 sm:m-5 px-1 py-3'>NO</button>
                <button onClick={handleClearCart} className='sm:w-2/5 w-40 sm:h-14 sm:m-5 bg-color-11 text-white'>YES, START AFRESH</button>
              </div>
            </div>
          }
        </>
      }

      <Toaster toastOptions={{
        className: 'font-ProximaNovaSemiBold',
        position: 'top-center',
        duration: 1500,
      }} />
    </>
  )
}

export default RestaurantCategory