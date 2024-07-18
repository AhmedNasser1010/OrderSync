const { onSnapshot, collection } = require("firebase/firestore")
const { db } = require('../config/firebase.js')
const { setValue } = require('../store.js')
const findDriversWithinDistance = require('./findDriversWithinDistance')
const filteredAvailableDrivers = require('./filteredAvailableDrivers')

async function handleNoDriverWithinDistance(order, resLocation) {
	console.log('ASSIGN: Waiting for online or drivers within specific distance...')

	try {
		const unsub = onSnapshot(collection(db, "drivers"), async querySnapshot => {
			const drivers = []

			 querySnapshot.forEach(doc => {
				drivers.push(doc.data())
			 })

			const onlineDrivers = filteredAvailableDrivers(drivers)
			const driversWithinDistance = findDriversWithinDistance(order, onlineDrivers, resLocation)

			if (driversWithinDistance && driversWithinDistance.drivers.length) {
				unsub()
				return { driversWithinDistance, drivers }
			}

		})
	} catch(e) {
		console.log('ASSIGN: Error while "handleNoDriverWithinDistance": ', e)
	}
}

module.exports = handleNoDriverWithinDistance