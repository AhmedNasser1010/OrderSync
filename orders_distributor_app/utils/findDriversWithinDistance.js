const { performance } = require('perf_hooks')
const getDistanceFromLatlngInKm = require('./getDistanceFromLatlngInKm')
const handleNoDriverWithinDistance = require('./handleNoDriverWithinDistance')
const { debuggingMode, distances } = require('../constants.js')

function findDriversWithinDistance(order, drivers, resLocation) {
	const start = performance.now()
	
	const closestDrivers = []

	for (const distance of distances) {

		if (drivers.length > 0) {
			for (const driver of drivers) {

				const driverDistance = getDistanceFromLatlngInKm(driver.liveLocation, resLocation)
				driverDistance <= distance && closestDrivers.push(driver)

			}
		}

		if (closestDrivers.length) {
			const end = performance.now()
			debuggingMode && console.log(`PASSED  6 ${(end - start).toFixed(2)}ms`)

			return { drivers: closestDrivers, distance }
		}

	}

	handleNoDriverWithinDistance(order, resLocation)
}

module.exports = findDriversWithinDistance