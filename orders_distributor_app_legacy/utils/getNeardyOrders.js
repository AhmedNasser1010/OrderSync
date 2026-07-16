const { performance } = require('perf_hooks')
const getDistanceFromLatlngInKm = require('./getDistanceFromLatlngInKm')
const { debuggingMode, maxDistanceInKm } = require('../constants.js')

function getNeardyOrders(currentResInProgressOrders, mainOrder) {
	const start = performance.now()
	
	const closestOrders = []

	for (const order of currentResInProgressOrders) {
		const progOrderDistance = getDistanceFromLatlngInKm(mainOrder.location.latlng, order.location.latlng)

		if (progOrderDistance <= maxDistanceInKm) {
			closestOrders.push(order)
		}

	}

	const end = performance.now()
	debuggingMode && console.log(`PASSED  12 ${(end - start).toFixed(2)}ms`)

	return closestOrders

}

module.exports = getNeardyOrders