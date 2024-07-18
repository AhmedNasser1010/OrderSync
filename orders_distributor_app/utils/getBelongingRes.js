async function getBelongingRes (restaurants, order) {
	try {
		const restaurant = await restaurants.filter(res => res.accessToken === order.accessToken)[0]
		if (restaurant?.accessToken) {
			return restaurant
		}

		console.log('ASSIGN: Error there is no restaurant belonging to this order')
		return null
	} catch(e) {
		console.log('ASSIGN: Error while "getBelongingRes": ', e)
		return null
	}
}

module.exports = getBelongingRes