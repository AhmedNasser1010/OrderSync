function findDriversWithSmallestOrders(drivers) {

	const filteredDrivers = []

	for (let count = 0;; count++) {

		if (count >= 100) return drivers

		for (const driver of drivers) {
			driver.closedOrdersToday === count && filteredDrivers.push(driver)
		}

		if (filteredDrivers.length) return filteredDrivers

	}
		
	console.log('ASSIGN: Error while "findDriversWithSmallestOrders"')
	return []
}

module.exports = findDriversWithSmallestOrders