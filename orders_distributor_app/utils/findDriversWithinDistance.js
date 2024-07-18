const getDistanceFromLatlngInKm = require('./getDistanceFromLatlngInKm')
const handleNoDriverWithinDistance = require('./handleNoDriverWithinDistance')

const distances = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3]

function findDriversWithinDistance(order, drivers, resLocation) {
	const closestDrivers = []

	for (const distance of distances) {

		if (drivers.length > 0) {
			for (const driver of drivers) {

				const driverDistance = getDistanceFromLatlngInKm(driver.liveLocation, resLocation)
				driverDistance <= distance && closestDrivers.push(driver)

			}
		}

		if (closestDrivers.length) return { drivers: closestDrivers, distance }

	}

	handleNoDriverWithinDistance(order, resLocation)
}

module.exports = findDriversWithinDistance