import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toggleLoginSidebar, toggleOrderSidebar } from '../rtk/slices/toggleSlice'
import toast from 'react-hot-toast'

import filterObject from '../utils/filterObject'
import getUserSource from '../utils/getUserSource'
import priceAfterDiscount from '../utils/priceAfterDiscount'
import getDeliveryFees from '../utils/getDeliveryFees'
import getDistanceFromLatlngInKm from '../utils/getDistanceFromLatlngInKm'
import orderYupSchema from '../object-schemas/orderYupSchema'
import { clearCart } from '../rtk/slices/cartSlice'
import { setShowRestaurantUnavailablePopup } from '../rtk/slices/toggleSlice'
import { useSetPlaceOrderMutation } from '../rtk/api/firestoreApi'

const usePlace = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const user = useSelector((state) => state.user)
  const cart = useSelector((state) => state.cart)
  const accessToken = cart.restaurant
  const menuItems = useSelector((state) => state.menu.items)
  const restaurants = useSelector((state) => state.restaurants)
  const services = useSelector((state) => state.services)
  const currentRes = restaurants?.find((restaurant) => restaurant.accessToken === cart.restaurant)
  const userDistanceFromRes =
    user?.locations?.selected &&
    currentRes?.profile?.latlng &&
    getDistanceFromLatlngInKm(
      user.locations[user.locations.selected].latlng,
      currentRes.profile.latlng
    )
  const deliveryFees = getDeliveryFees(userDistanceFromRes, services.deliveryFees)
  const [setPlaceOrder] = useSetPlaceOrderMutation()

  const showError = (message, sidebar = 'login') => {
    toast.error(t(message), {
      className: 'font-ProximaNovaSemiBold',
      position: 'top-center',
      duration: 4000
    })
    if (sidebar === 'login') {
      dispatch(toggleLoginSidebar())
    } else {
      dispatch(toggleOrderSidebar())
    }
  }

  const checkIfUserIsLoggedIn = () => {
    if (user?.uid) return true
    showError(
      'Please log in first and update your contact information before continuing with your order.'
    )
    return false
  }

  const checkUserInformation = () => {
    if (user?.userInfo?.name && user?.userInfo?.phone) return true
    showError('Update user information first')
    return false
  }

  const checkIfUserHasLocation = () => {
    const selectedLocation = user?.locations[user?.locations?.selected]
    if (
      selectedLocation?.address &&
      selectedLocation?.latlng?.[0] &&
      selectedLocation?.latlng?.[1]
    ) {
      return true
    }
    showError('Error update your location address first')
    return false
  }

  const checkIfUserHasCart = () => {
    return cart?.items?.length > 0 || showError('Your cart is empty')
  }

  const checkIfUserHasNoOrder = () => {
    if (!user?.trackedOrder?.id) return true
    showError('You already have an order in progress', 'order')
    return false
  }

  const getCartFromMenu = () => {
    return cart.items
      .map((cartItem) => {
        const menuItem = menuItems?.find((menuItem) => menuItem.id === cartItem.id)
        if (menuItem) {
          return {
            ...menuItem,
            ...cartItem
          }
        }
        return null
      })
      .filter((item) => item !== null)
  }

  const getCartTotalPrice = () => {
    const selectedItems = getCartFromMenu()
    return selectedItems?.reduce(
      (accumulator, item) => {
        const { price } = item?.selectedSize
          ? item?.sizes?.find((itemSize) => itemSize.size === item?.selectedSize)
          : { price: item.price }
        const { finalPrice, isAvailableForUser } = priceAfterDiscount(
          price,
          item.discount,
          user,
          accessToken
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
  }

  const orderDataFinalize = (comment) => {
    const currentResLoyaltyData = user?.restaurants?.find((res) => res.accessToken === accessToken)
    const orderSource = getUserSource()
    const filteredCart = cart.items.map((obj) => filterObject(obj, ['discount'], true))
    const cartTotalPrice = getCartTotalPrice()
    const selectedLocation = user.locations[user.locations.selected]

    const subtotal = cartTotalPrice.total - deliveryFees
    const discount = cartTotalPrice.total - cartTotalPrice.discount

    return {
      customerUid: user.uid,
      business: {
        id: currentRes.accessToken,
        name: currentRes.name,
        phone: currentRes.phone,
        address: currentRes.profile.address,
        latlng: currentRes.profile.latlng,
      },
      assignment: { driverUid: null },
      delivery: {
        address: selectedLocation.address,
        latlng: selectedLocation.latlng,
        note: comment || undefined,
      },
      cart: filteredCart.map((item) => {
        const menuItem = menuItems?.find((mi) => mi.id === item.id)
        return {
          id: item.id,
          name: menuItem?.title || '',
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          discountCode: item.discount?.code || undefined,
        }
      }),
      pricing: {
        subtotal,
        discount,
        deliveryFees,
        total: cartTotalPrice.discount,
      },
      payment: {
        method: 'CASH',
        status: 'COMPLETED',
      },
      finance: {
        commissionPercent: 0,
        commissionAmount: 0,
        restaurantShare: 0,
        companyShare: 0,
        cashCollected: 0,
      },
      reconciliation: {
        settlementId: null,
        restaurantPaid: false,
      },
      notes: { order: comment || undefined },
      metadata: {
        orderSource,
        cancelAutoAssign: false,
      },
      customer: {
        uid: user.uid,
        name: user.userInfo.name,
        phone: user.userInfo.phone,
        secondPhone: user.userInfo.secondPhone,
        firstOrderDate: currentResLoyaltyData?.firstOrderTime || Date.now(),
        totalOrders: currentResLoyaltyData?.totalOrders || 1,
        totalOrdersValue: currentResLoyaltyData?.totalAmount || cartTotalPrice.discount,
      },
    }
  }

  const validateOrderData = (comment) => {
    return orderYupSchema.validate(orderDataFinalize(comment), { abortEarly: false })
  }

  const placeOrderMutation = (validatedData) => {
    return setPlaceOrder(validatedData).unwrap()
  }

  const handleOrderPlacementSuccess = () => {
    toast.success(t('Order placed successfully'), {
      className: 'font-ProximaNovaSemiBold',
      position: 'top-center',
      duration: 4000
    })
  }

  const handleOrderPlacementError = (err) => {
    if (
      err?.code === 'RESTAURANT_NOT_ACCEPTING_ORDERS' ||
      err?.data?.code === 'RESTAURANT_NOT_ACCEPTING_ORDERS'
    ) {
      dispatch(setShowRestaurantUnavailablePopup(true))
      return
    }

    toast.error(t('Error placing order'), {
      className: 'font-ProximaNovaSemiBold',
      position: 'top-center',
      duration: 4000
    })
    console.error(err)
  }

  const placeOrder = (comment) => {
    return new Promise((resolve, reject) => {
      if (
        checkIfUserIsLoggedIn() &&
        checkUserInformation() &&
        checkIfUserHasLocation() &&
        checkIfUserHasCart() &&
        checkIfUserHasNoOrder()
      ) {
        validateOrderData(comment)
          .then((validatedData) => {
            placeOrderMutation(validatedData)
              .then(() => {
                handleOrderPlacementSuccess()
                resolve()
              })
              .catch((err) => {
                handleOrderPlacementError(err)
                reject(err)
              })
          })
          .catch((err) => {
            handleOrderPlacementError(err)
            reject(err)
          })
      } else {
        reject(new Error('Order placement failed'))
      }
    })
  }

  return {
    placeOrder
  }
}

export default usePlace
