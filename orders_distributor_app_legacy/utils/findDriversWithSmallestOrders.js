const { performance } = require('perf_hooks')
const { debuggingMode } = require('../constants.js')
const { store } = require('../store.js')

function findDriversWithSmallestOrders(drivers) {
	const start = performance.now()

	const filteredDrivers = []

	for (let count = 0;; count++) {

		if (count >= 100) return drivers

		for (const driver of drivers) {
			console.log(driver.uid)
			const closedOrdersTodayByDriver = store.orders.values.reduce((acc, order) => {
		    if (order.status === 'COMPLETED' && order.assign.driver === driver.uid) acc++
		    return acc
			}, 0)
			closedOrdersTodayByDriver === count && filteredDrivers.push(driver)
		}

		if (filteredDrivers.length) {
			const end = performance.now()
			debuggingMode && console.log(`PASSED  8 ${(end - start).toFixed(2)}ms`)

			return filteredDrivers
		}

	}
		
	console.log('ASSIGN: Error while "findDriversWithSmallestOrders"')
	return []
}

module.exports = findDriversWithSmallestOrders