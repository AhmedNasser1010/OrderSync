const { onSnapshot, collection } = require("firebase/firestore")
const { db } = require('../config/firebase.js')
const filteredAvailableDrivers = require('./filteredAvailableDrivers.js')
const findDriversWithinDistance = require('./findDriversWithinDistance.js')

const maxQueueLength = [0, 1, 2, 3]

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
		if (!drivers && drivers.length) {
			console.log('ASSIGN: Error while "findDriversWithQueue", `drivers` not found')
			return []
		}

		const driversWithLessQueue = getDriversLessQueue(drivers)

		if (driversWithLessQueue.length) return driversWithLessQueue

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
				return driversWithLessQueue
			}

		})
	} catch(e) {
		console.log('ASSIGN: Error while "findDriversWithQueue": ', e)
		return []
	}
}

module.exports = findDriversWithQueue