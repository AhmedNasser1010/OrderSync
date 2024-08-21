import { useMemo, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import toast from 'react-hot-toast'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import SEO from '../../components/SEO'

import { quantityHandle, clearCart, handleAddDiscount } from '../../rtk/slices/cartSlice'
import { addCheckout, clearCheckout } from '../../rtk/slices/checkoutSlice'
import { toggleLoginSidebar, toggleOrderSidebar } from '../../rtk/slices/toggleSlice'

import priceAfterDiscount from '../../utils/priceAfterDiscount'
import generateDiscountObj from '../../utils/generateDiscountObj'
import randomOrderId from '../../utils/randomOrderId'
import DB_ARRAY_UNION from '../../utils/DB_ARRAY_UNION'
import useUpdateUserOnSendOrder from '../../hooks/useUpdateUserOnSendOrder.js'
import getDistanceFromLatlngInKm from '../../utils/getDistanceFromLatlngInKm'
import getDeliveryFees from '../../utils/getDeliveryFees'
import ItemInfoSide from '../restaurant-menu/ItemInfoSide'
import ItemPreviewSide from '../restaurant-menu/ItemPreviewSide'
import ItemAvailability from '../restaurant-menu/ItemAvailability'
import ItemTitle from '../restaurant-menu/ItemTitle'
import DiscountMsg from '../restaurant-menu/DiscountMsg'
import ItemPrice from '../restaurant-menu/ItemPrice'
import ItemDescription from '../restaurant-menu/ItemDescription'
import ItemSizesBar from '../restaurant-menu/ItemSizesBar'


import OrderInfo from './OrderInfo'

// .matches(/^\+201\d{9}$/, 'Second phone number must be a valid Egyptian phone number').required('Second phone number is required')

const validationSchema = Yup.object().shape({
  comment: Yup.string(),
  user: Yup.object()
    .shape({
      name: Yup.string().required('Name is required'),
      phone: Yup.string()
        .required('Phone number is required')
        .matches(/^\+201\d{9}$|^01\d{9}$/, 'Phone number must be a valid Egyptian phone number'),
      secondPhone: Yup.string()
    })
    .required('User information is required'),
  location: Yup.object()
    .shape({
      latlng: Yup.array()
        .of(Yup.number().required())
        .length(2, 'User location is required')
        .required('User location is required'),
      address: Yup.string().required('Address is required')
    })
    .required('Location information is required'),
  payment: Yup.object()
    .shape({
      method: Yup.string()
        .oneOf(['CASH', 'CARD', 'OTHER'], 'Invalid payment method')
        .required('Payment method is required')
    })
    .required('Payment information is required'),
  cart: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.string().uuid('Item must be a valid UUID').required('Item is required'),
        quantity: Yup.number()
          .min(1, 'Quantity must be at least 1')
          .required('Quantity is required')
      })
    )
    .required('Cart cannot be empty')
})

const StyledWindow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  max-width: 400px;

  & svg {
    width: 200px;
  }

  & p {
    text-align: center;
    font-size: 17px;
    line-height: 24px;
    max-width: 70%;
    font-weight: bold;
  }
`

const sizeOptions = {
  S: 'Small',
  M: 'Medium',
  L: 'Large'
}

const Cart = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cartItems = useSelector((state) => state.cart.items)
  const cartRestaurantID = useSelector((state) => state.cart.restaurant)
  const menuItems = useSelector((state) => state.menu.items)
  const restaurants = useSelector((state) => state.restaurants)
  const checkout = useSelector((state) => state.checkout)
  const accessToken = useSelector((state) => state.cart.restaurant)
  const user = useSelector((state) => state.user)
  const [comment, setComment] = useState('')
  const [disableSubmit, setDisableSubmit] = useState(false)
  const updateUserOnSendOrder = useUpdateUserOnSendOrder()
  const services = useSelector((state) => state.services)
  const [deliveryFees, setDeliveryFees] = useState(0)

  useEffect(() => {
    dispatch(
      addCheckout({
        assign: {
          driver: null,
          cook: null,
          status: 'pickup',
          cancelAutoAssign: false,
          driverStartAt: null,
          cookStartAt: null
        },
        user: {
          uid: user?.userInfo?.uid,
          name: user?.userInfo?.name,
          phone: user?.userInfo?.phone,
          secondPhone: user?.userInfo?.secondPhone
        },
        location: {
          latlng: user?.locations?.home?.latlng,
          address: user?.locations?.home?.address
        },
        cart: cartItems
      })
    )
  }, [user, cartItems])

  const resInfo = useMemo(() => {
    return restaurants?.filter((restaurant) => restaurant.accessToken === cartRestaurantID)[0]
  }, [restaurants, cartRestaurantID])

  useEffect(() => {
    if (!user?.locations?.selected) return setDeliveryFees(0)
    if (
      !user.locations[user.locations.selected].latlng[0] &&
      !user.locations[user.locations.selected].latlng[1]
    )
      return setDeliveryFees(0)
    if (resInfo && user.locations) {
      const userDistanceFromRes = getDistanceFromLatlngInKm(
        user.locations[user.locations.selected].latlng,
        resInfo.business.latlng
      )
      const fees = getDeliveryFees(userDistanceFromRes, services.deliveryFees)
      setDeliveryFees(fees)
    }
  }, [resInfo, user])

  const selectedItems = useMemo(() => {
    return cartItems
      ?.map((cartItem) => {
        const menuItem = menuItems?.find((menuItem) => menuItem.id === cartItem.id)
        if (menuItem) {
          return { ...menuItem, quantity: cartItem.quantity, selectedSize: cartItem?.selectedSize || null }
        }
        return null
      })
      .filter((item) => item !== null)
  }, [cartItems, menuItems])

  const cartTotalPrice = useMemo(() => {
    return selectedItems?.reduce(
      (accumulator, item) => {
        const { price } = item?.selectedSize ? item?.sizes?.find((itemSize) => itemSize.size === item?.selectedSize) : { price: item.price }
        const { finalPrice, isAvailableForUser } = priceAfterDiscount(
          price,
          item.discount,
          user,
          cartRestaurantID
        )
        const discountIncluded = isAvailableForUser && price !== finalPrice
        if (discountIncluded) {
          return {
            total: accumulator.total + price * item.quantity,
            discount: accumulator.discount + finalPrice * item.quantity
          }
        } else {
          return {
            total: accumulator.total + price * item.quantity,
            discount: accumulator.discount + price * item.quantity
          }
        }
      },
      { total: deliveryFees, discount: deliveryFees }
    )
  }, [cartItems, deliveryFees])

  useEffect(() => {
    if (selectedItems.length) {
      selectedItems.map((item) => {
        const discountObj = item?.discount?.code ? generateDiscountObj(item?.discount) : null
        if (discountObj) {
          const { finalPrice, isAvailableForUser } = priceAfterDiscount(
            item.price,
            item.discount,
            user,
            cartRestaurantID
          )
          const discountIncluded = isAvailableForUser && item.price !== finalPrice
          if (discountIncluded) {
            dispatch(
              handleAddDiscount({
                id: item.id,
                discountCode: `${discountObj.type}-${discountObj.value}`
              })
            )
          }
        }
      })
    }
  }, [])

  const handleIncreaseQty = (item) => {
    dispatch(quantityHandle({ id: item.id, quantity: '+', selectedSize: item?.selectedSize }))
  }

  const handleDecreaseQty = (item) => {
    dispatch(quantityHandle({ id: item.id, quantity: '-', selectedSize: item?.selectedSize }))
  }

  const handleClearAll = () => {
    dispatch(clearCart())
    toast.success(t('Cart is cleared Successfully'), {
      className: 'font-ProximaNovaSemiBold',
      position: 'top-center',
      duration: 1500
    })
  }

  const handleComment = (e) => {
    setComment(e.target.value)
    dispatch(
      addCheckout({
        comment: e.target.value
      })
    )
  }

  const handleOrderSubmission = async (final) => {
    try {
      const updatedUser = await updateUserOnSendOrder(accessToken, user, final)

      if (!updatedUser) {
        setDisableSubmit(false)
        throw new Error('Operation failed update user')
      }

      const ordersIsUpdated = await DB_ARRAY_UNION('orders', accessToken, 'open', final)

      if (!ordersIsUpdated) {
        setDisableSubmit(false)
        throw new Error('Operation failed update orders')
      }

      dispatch(clearCart())
      dispatch(clearCheckout())
      navigate('/')
      dispatch(toggleOrderSidebar())

      return true
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  const handlePayment = () => {
    setDisableSubmit(true)

    if (user?.trackedOrder?.id) {
      toast.error(t('You already have an a order in progress'), {
        className: 'font-ProximaNovaSemiBold',
        position: 'top-center',
        duration: 4000
      })
      dispatch(toggleOrderSidebar())
      return false
    }

    if (!user?.userInfo?.uid) {
      toast(
        t(
          'Please log in first and update your contact information before continuing with your order.'
        ),
        {
          icon: '🤌',
          className: 'font-ProximaNovaSemiBold',
          position: 'top-center',
          duration: 4000
        }
      )
      dispatch(toggleLoginSidebar())
      return false
    }

    validationSchema
      .validate(checkout, { abortEarly: false })
      .then((valid) => {
        if (accessToken) {
          if (
            valid.location.latlng[0] === 29.620106778124843 &&
            valid.location.latlng[1] === 31.255811811669496
          ) {
            dispatch(toggleLoginSidebar())
            toast.error(t('Error update your location address first'), {
              className: 'font-ProximaNovaSemiBold',
              position: 'top-center',
              duration: 3000
            })
            return false
          }
          const final = {
            ...valid,
            accessToken,
            id: randomOrderId(),
            status: 'RECEIVED',
            timestamp: Number(Date.now()),
            statusUpdatedSince: Number(Date.now()),
            deliveryFees,
            cartTotalPrice
          }

          toast.promise(
            handleOrderSubmission(final),
            {
              loading: t('Sending...'),
              success: t('Success.'),
              error: t('An unexpected error occurred while sending your order. Please try again.')
            },
            {
              success: {
                className: 'font-ProximaNovaSemiBold',
                position: 'top-center',
                duration: 3000
              },
              error: {
                className: 'font-ProximaNovaSemiBold text-red-500',
                position: 'top-center',
                duration: 3000
              }
            }
          )
        } else {
          toast.error(t('Error restaurant id not found.'), {
            className: 'font-ProximaNovaSemiBold text-red-500',
            position: 'top-center',
            duration: 3000
          })
        }
      })
      .catch((err) => {
        setDisableSubmit(false)

        if (err.errors.includes('Name is required')) {
          toast.error(t('Name is required'))
          dispatch(toggleLoginSidebar())
          return
        }

        if (err.errors.includes('Phone number is required')) {
          toast.error(t('Phone number is required'))
          dispatch(toggleLoginSidebar())
          return
        }

        if (err.errors.includes('Phone number must be a valid Egyptian phone number')) {
          toast.error(t('Phone number must be a valid Egyptian phone number'))
          dispatch(toggleLoginSidebar())
          return
        }

        if (
          err.errors.includes('location.latlng[0] is a required field') ||
          err.errors.includes('location.latlng[1] is a required field')
        ) {
          toast.error(t('Location is required'))
          dispatch(toggleLoginSidebar())
          return
        }

        if (err.errors.includes('Address is required')) {
          toast.error(t('Address is required'))
          dispatch(toggleLoginSidebar())
          return
        }

        err.errors.map((err, i) => {
          toast.error(t(err), {
            duration: Number(`${i + 2}500`),
            className: 'font-ProximaNovaSemiBold',
            position: 'top-center'
          })
        })
      })
  }

  return (
    <>
      <SEO
        title="زاجل ايتس | السلة"
        description="اطلب أكل لذيذ أونلاين من مطاعمك المحلية المفضلة مع زاجل إيتس. توصيل أكل سريع وموثوق لحد بابك."
      />
      {cartItems.length === 0 ? (
        <div className="mx-auto pt-5 mb-10 md:w-1/2 min-h-screen">
          <div className="flex items-center justify-center flex-col mt-20">
            <img src="/assets/empty-cart.webp" alt="empty-cart" className="w-72 h-64" />
            <h2 className="mt-6 text-xl text-color-6 font-ProximaNovaSemiBold">
              {t('Your cart is empty')}
            </h2>
            <p className="mt-1 text-color-8 font-ProximaNovaThin text-sm">
              {t('You can go to home page to view more restaurants')}
            </p>
            <Link
              to="/"
              className="uppercase mt-7 py-3 px-5 bg-color-2 text-white font-ProximaNovaBold cursor-pointer border-0 text-[15px] text-center">
              {t('see restaurants near you')}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mx-auto mt-28 mb-10 2xl:w-1/2 md:w-4/5 md:px-0 px-5">
            <div className="checkout-container">
              <div className="flex items-start justify-center gap-4 my-3">
                <div>
                  <img src={resInfo?.business.cover} alt="res-img" className="w-20" />
                </div>
                <div className="tracking-tighter">
                  <h2 className="font-ProximaNovaMed sm:text-2xl text-lg">
                    {resInfo?.business?.name}
                  </h2>
                  <p className="font-ProximaNovaThin sm:text-base text-sm -mt-1">{t('El-Ayat')}</p>
                </div>
              </div>
              {selectedItems?.map((item) => {
                const { size, price } = item?.selectedSize ? item?.sizes?.find((itemSize) => itemSize.size === item?.selectedSize) : { size: null, price: item.price }
                const { finalPrice, isAvailableForUser } = item?.discount?.code
                  ? priceAfterDiscount(price ?? item?.price, item.discount, user, resInfo.id)
                  : { finalPrice: price ?? item?.price, isAvailableForUser: false }
                const discountIncluded = isAvailableForUser && price !== finalPrice
                return (
                  <div key={item?.id+item?.selectedSize} className="item flex items-start justify-between pb-8">
                    <div className="md:w-auto w-3/5">
                      <ItemAvailability />
                      <ItemTitle title={item?.title} discountIncluded={discountIncluded} />
                      <DiscountMsg
                        discountMsg={item?.discount?.message}
                        discountIncluded={discountIncluded}
                      />
                      <ItemPrice
                        price={price ?? item?.price}
                        finalPrice={finalPrice ?? item?.price}
                        discountIncluded={discountIncluded}
                      />
                      <ItemDescription description={item?.description} />
											<ItemSizesBar
												item={item}
												selectedSize={size}
											/>
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
                      <div className="absolute flex justify-around items-center text-x1 -bottom-2 left-1/2 -translate-x-1/2 z-[1] w-24 h-9 shadow-md shadow-color-7 bg-color-11 text-white text-center inline-block rounded text-sm font-ProximaNovaSemiBold uppercase">
                        <button className="w-1/3 h-full" onMouseUp={() => handleIncreaseQty(item)}>
                          +
                        </button>
                        <span className="w-1/3">{item.quantity}</span>
                        <button className="w-1/3 h-full" onMouseUp={() => handleDecreaseQty(item)}>
                          -
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
              <OrderInfo deliveryFees={deliveryFees} />
              {cartTotalPrice.total !== cartTotalPrice.discount && (
                <>
                  <div className="discount flex justify-between bg-color-11 text-white py-2 sm:py-3 px-3 md:text-xl my-2 sm:flex-row flex-col sm:items-start items-center">
                    <div>
                      <h3 className="font-ProximaNovaSemiBold">{t('Total Price')}</h3>
                    </div>
                    <div>
                      <span className="egp font-ProximaNovaSemiBold">{cartTotalPrice.total}</span>
                    </div>
                  </div>
                  <div className="flex justify-between bg-color-11 text-white py-2 sm:py-3 px-3 md:text-xl my-2 sm:flex-row flex-col sm:items-start items-center">
                    <div>
                      <h3 className="font-ProximaNovaSemiBold">{t('Total Price Dsicounted')}</h3>
                    </div>
                    <div>
                      <span className="egp font-ProximaNovaSemiBold">
                        {cartTotalPrice.discount}
                      </span>
                    </div>
                  </div>
                </>
              )}
              {cartTotalPrice.total === cartTotalPrice.discount && (
                <div className="flex justify-between bg-color-11 text-white py-2 sm:py-3 px-3 md:text-xl my-2 sm:flex-row flex-col sm:items-start items-center">
                  <div>
                    <h3 className="font-ProximaNovaSemiBold">{t('Total Price')}</h3>
                  </div>
                  <div>
                    <span className="egp font-ProximaNovaSemiBold">{cartTotalPrice.total}</span>
                  </div>
                </div>
              )}
              <input
                className="w-full p-3 border border-gray-300"
                id="comment"
                type="text"
                placeholder={t('Comment, extras')}
                value={comment}
                onChange={handleComment}
              />
              <div className="flex items-center justify-center gap-2 mt-2 checkout-btns">
                <button
                  onClick={() => !disableSubmit && handlePayment()}
                  className="bg-color-11 border border-color-11 text-white hover:bg-white hover:text-color-11">
                  {t('Place Order')}
                </button>
                <button
                  onClick={handleClearAll}
                  className="border border-red-500 bg-red-500 text-white hover:bg-white hover:text-red-500">
                  {t('Clear All')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default Cart
