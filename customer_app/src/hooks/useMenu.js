import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import priceAfterDiscount from '../utils/priceAfterDiscount'

const useMenu = () => {
	const menuItemsSelector = useSelector(state => state.menu.items)
	const cartSelector = useSelector(state => state.cart.items)

	const total = (menuItemsArg, cartArg, selectedMenuItemsArg) => {
		const menuItems = menuItemsArg || menuItemsSelector || []
		const cart = cartArg || cartSelector || []

		const selectedMenuItems = selectedMenuItemsArg || cart?.map(cartItem => {
		  const matchedItem = menuItems?.find(menuItem => menuItem?.id === cartItem?.id)
		  if (matchedItem) return { ...matchedItem, quantity: cartItem.quantity }
		})

		const price = selectedMenuItems?.reduce((acc, item) => {
		  const discountedPrice = priceAfterDiscount(item?.price, item?.discount?.code)
		  return {
		    total: acc.total + (item.price * item.quantity),
		    discount: acc.discount + (discountedPrice * item.quantity),
		  }
		}, { total: 0, discount: 0 })

		return { items: selectedMenuItems, price }
	}

	return total
}

export default useMenu