const getDistanceFromLatlngInKm = require('./getDistanceFromLatlngInKm')

// 200m
const maxDistanceInKm = 0.2

function getNeardyOrders(currentResInProgressOrders, mainOrder) {
	const closestOrders = []

	for (const order of currentResInProgressOrders) {
		const progOrderDistance = getDistanceFromLatlngInKm(mainOrder.location.latlng, order.location.latlng)

		if (progOrderDistance <= maxDistanceInKm) {
			closestOrders.push(order)
		}

	}

	return closestOrders

}

module.exports = getNeardyOrders