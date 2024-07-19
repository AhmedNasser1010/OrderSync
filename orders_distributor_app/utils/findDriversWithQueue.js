const { performance } = require('perf_hooks')
const { onSnapshot, collection } = require("firebase/firestore")
const { db } = require('../config/firebase.js')
const filteredAvailableDrivers = require('./filteredAvailableDrivers.js')
const findDriversWithinDistance = require('./findDriversWithinDistance.js')
const { debuggingMode, maxQueueLength } = require('../constants.js')

function getDriversLessQueue(drivers) {
	const driversWithQueue = []

	for (const queueLength of maxQueueLength) {

		for (const driver of drivers) {

			driver.queue.length === queueLength && driversWithQueue.push(driver)

		}

		if (driversWithQueue.length > 0) return driversWithQueue

	}

	return []
}

async function findDriversWithQueue(drivers, order, resLocation) {
	try {
		const start = performance.now()
		
		if (!drivers && drivers.length) {
			console.log('ASSIGN: Error while "findDriversWithQueue", `drivers` not found')
			return []
		}

		const driversWithLessQueue = getDriversLessQueue(drivers)

		if (driversWithLessQueue.length) {
			const end = performance.now()
			debuggingMode && console.log(`PASSED  7 ${(end - start).toFixed(2)}ms`)

			return driversWithLessQueue
		}

		const unsub = onSnapshot(collection(db, "drivers"), async querySnapshot => {
			const drivers = []

			querySnapshot.forEach(doc => {
				drivers.push(doc.data())
			})

			const onlineDrivers = await filteredAvailableDrivers(drivers)
			const driversWithinDistance = await findDriversWithinDistance(order, onlineDrivers, resLocation)
			const driversWithLessQueue = getDriversLessQueue(driversWithinDistance.drivers)

			if (driversWithLessQueue.length) {
				unsub()

				const end = performance.now()
				debuggingMode && console.log(`PASSED  7 ${(end - start).toFixed(2)}ms`)

				return driversWithLessQueue
			}

		})
	} catch(e) {
		console.log('ASSIGN: Error while "findDriversWithQueue": ', e)
		return []
	}
}

module.exports = findDriversWithQueue