const { GET_COLLECTION } = require('./FIRESTORE/DB_CONTROLLERS.js')
const { setState, setValue } = require('../store.js')

async function getDrivers() {
	try {
		let driversData = []
		const drivers = await GET_COLLECTION('drivers')
		.then(drivers => {
			if (drivers) {
				setState('drivers')
				setValue('drivers', drivers)
				driversData = drivers
				return drivers
			}
			console.log('ASSIGN: Error while "getDrivers" no drivers founded')
			driversData = []
			return []
		})

		if (drivers && drivers.length === 0) {
			console.log('ASSIGN: You have no drivers in your collection')
			driversData = []
			return []
		}

		return driversData
	} catch(e) {
		console.log('ASSIGN: Error while "getDrivers": ', e)
		return []
	}
}

module.exports = getDrivers