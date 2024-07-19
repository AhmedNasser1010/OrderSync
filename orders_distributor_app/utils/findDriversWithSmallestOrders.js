const { performance } = require('perf_hooks')
const { debuggingMode } = require('../constants.js')

function findDriversWithSmallestOrders(drivers) {
	const start = performance.now()

	const filteredDrivers = []

	for (let count = 0;; count++) {

		if (count >= 100) return drivers

		for (const driver of drivers) {
			driver.closedOrdersToday === count && filteredDrivers.push(driver)
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