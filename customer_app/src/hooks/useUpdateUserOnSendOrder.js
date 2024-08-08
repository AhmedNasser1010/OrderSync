import { useDispatch, useSelector } from 'react-redux'

import useMenu from './useMenu'
import DB_ADD_DOC from '../utils/DB_ADD_DOC'
import { initUser } from '../rtk/slices/userSlice'

const useUpdateUserOnSendOrder = () => {
	const menu = useMenu()
	const dispatch = useDispatch()
	const menuItems = useSelector(state => state.menu.items)
	const cart = useSelector(state => state.cart.items)


	const updateUserOnSendOrder = (accessToken, user, placedOrder) => {

		const selectedMenuItems = cart?.map(cartItem => {
		  const matchedItem = menuItems?.find(menuItem => menuItem?.id === cartItem?.id)
		  if (matchedItem) return { ...matchedItem, quantity: cartItem.quantity }
		})

		const myMenu = menu(menuItems, cart, selectedMenuItems)
		const totalItemsNum = myMenu.items.reduce((acc, item) => {
			return acc + item.quantity
		}, 0)

		let isFirstTime = true
		user.restaurants.map(res => {
			if (res.accessToken === accessToken) {
				isFirstTime = false
				return
			}
		})

		if (user.restaurants.length === 0) {
			const userCopy = {
			  ...user,
			  referral: {
			  	...user.referral,
			  	isFirstOrder: false
			  },
			  restaurants: [
			    {
			      accessToken,
			      totalAmount: myMenu.price?.discount ?? null,
			      totalItems: totalItemsNum,
			      totalOrders: 1,
			      lastOrderTime: Date.now(),
			      fisrOrderTime: Date.now()
			    }
			  ],
			  trackedOrder: {
				  id: placedOrder.id,
			    restaurant: accessToken
				}
			}

			DB_ADD_DOC('customers', user.userInfo.uid, userCopy)
			.then(res => res && dispatch(initUser(userCopy)))
		} else {
			if (isFirstTime) {

				const userCopy = {
				  ...user,
				  restaurants: [
				  	...user.restaurants,
				    {
				      accessToken,
				      totalAmount: myMenu.price?.discount ?? null,
				      totalItems: totalItemsNum,
				      totalOrders: 1,
				      lastOrderTime: Date.now(),
				      fisrOrderTime: Date.now()
				    }
				  ],
				  trackedOrder: {
				  	id: placedOrder.id,
			    	restaurant: accessToken
				  }
				}

				DB_ADD_DOC('customers', user.userInfo.uid, userCopy)
				.then(res => res && dispatch(initUser(userCopy)))
			} else {

				const userCopy = {
					...user,
					restaurants: user.restaurants.map(res => {
						// the issue here is this condition return one restaurant event if there is more in the prev
						if (res?.accessToken === accessToken) {
							const totalAmount = res?.totalAmount + (myMenu?.price?.discount ?? 0)
							const totalItems = res?.totalItems + totalItemsNum
							const totalOrders = res?.totalOrders + 1
							return {
								...res,
								totalAmount,
								totalItems,
								totalOrders,
								lastOrderTime: Date.now()
							}
						}
						return res
					}),
					trackedOrder: {
				  	id: placedOrder.id,
			    	restaurant: accessToken
				  }
				}

				DB_ADD_DOC('customers', user.userInfo.uid, userCopy)
				.then(res => res && dispatch(initUser(userCopy)))
			}
		}


	}

	return updateUserOnSendOrder
}

export default useUpdateUserOnSendOrder