const { performance } = require('perf_hooks')
const timestampsDifferenceInMs = require('./timestampsDifferenceInMs')
const { debuggingMode, divideOn, maxExtraOrdersLength } = require('../constants.js')

function getAboutToDone(orders, cookTime) {
	const start = performance.now()
	
	if (!orders.length) {
		const end = performance.now()
		debuggingMode && console.log(`PASSED  13 ${(end - start).toFixed(2)}ms`)

		return []
	}

	const filteredOrders = []

	for (const order of orders) {
		const acceptedPassedTime = cookTime[0] / divideOn
		const dirrerenceTimestamp = timestampsDifferenceInMs(order.statusUpdatedSince, Date.now())
		const differenceInMs = new Date(dirrerenceTimestamp).getMinutes() * 1000

		differenceInMs > acceptedPassedTime && filteredOrders.push(order)

	}

	if (filteredOrders.length >= maxExtraOrdersLength) {
		const end = performance.now()
		debuggingMode && console.log(`PASSED  13 ${(end - start).toFixed(2)}ms`)

		return filteredOrders.slice(0, 3)
	}

	const end = performance.now()
	debuggingMode && console.log(`PASSED  13 ${(end - start).toFixed(2)}ms`)

	return filteredOrders
}

module.exports = getAboutToDone