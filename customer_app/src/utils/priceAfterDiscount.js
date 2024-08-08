import generateDiscountObj from './generateDiscountObj'

const firstBuy = (user, conditionValue, currentRes) => {
	return currentRes === undefined
}
const totalSpent = (user, conditionValue, currentRes) => {
	if (currentRes?.totalAmount >= conditionValue) return true
	return false
}
const totalItems = (user, conditionValue, currentRes) => {
	if (currentRes?.totalItems >= conditionValue) return true
	return false
}
const totalOrders = (user, conditionValue, currentRes) => {
	if (currentRes?.totalOrders >= conditionValue) return true
	return false
}

const priceAfterDiscount = (price, discount, user, resId) => {
	// If not discount available return default data
	if (!discount) return { finalPrice: price, isAvailableForUser: false }
		
	const discountObj = generateDiscountObj(discount)
	let finalPrice = price
	let isAvailableForUser = false


	switch (discountObj.type) {
		case 'FIXED':
			finalPrice -= discountObj.value
			if (finalPrice <= 0.4) finalPrice = 0
			break;
		case 'P':
			const decimal = discountObj.value / 100
			 finalPrice = price * (1 - decimal);
			break;
		default:
			finalPrice = price
			break;
	}

	if (discountObj.conditions.length && user.restaurants) {
		// If the user isnt logged in display all discounts
		// if (!user.restaurants) return isAvailableForUser = true

		const value = discountObj.conditions[0].value
		const currentRes = user.restaurants.filter(res => res.accessToken === resId)[0]

		switch (discountObj.conditions[0].type) {
			case 'FIRSTBUY':
				isAvailableForUser = firstBuy(user, value, currentRes)
				break;
			case 'TOTALSPENT':
				isAvailableForUser = totalSpent(user, value, currentRes)
				break;
			case 'TOTALITEMS':
				isAvailableForUser = totalItems(user, value, currentRes)
				break;
			case 'TOTALORDERS':
				isAvailableForUser = totalOrders(user, value, currentRes)
				break;
			default:
				isAvailableForUser = false
				break;
		}
	} else {
		// If there is no conditions set to true
		isAvailableForUser = true
	}

	// If the user isnt logged in display all discounts
	if (!user.restaurants) isAvailableForUser = true

	return { finalPrice, isAvailableForUser }
}

export default priceAfterDiscount