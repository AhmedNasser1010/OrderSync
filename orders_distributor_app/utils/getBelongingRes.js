const { performance } = require('perf_hooks')
const { debuggingMode } = require('../constants.js')

async function getBelongingRes (restaurants, order) {
	try {
		const start = performance.now()
		
		const restaurant = await restaurants.filter(res => res.accessToken === order.accessToken)[0]
		if (restaurant?.accessToken) {
			const end = performance.now()
			debuggingMode && console.log(`PASSED  5 ${(end - start).toFixed(2)}ms`)

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