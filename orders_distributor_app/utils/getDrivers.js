const { performance } = require('perf_hooks')
const { GET_COLLECTION } = require('./FIRESTORE/DB_CONTROLLERS.js')
const { setState, setValue } = require('../store.js')
const { debuggingMode } = require('../constants.js')


async function getDrivers() {
	try {
		const start = performance.now()
		
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

			const end = performance.now()
    	debuggingMode && console.log(`PASSED  2 ${(end - start).toFixed(2)}ms`)

			driversData = []
			return []
		})

		if (drivers && drivers.length === 0) {
			console.log('ASSIGN: You have no drivers in your collection')

			const end = performance.now()
    	debuggingMode && console.log(`PASSED  2 ${(end - start).toFixed(2)}ms`)

			driversData = []
			return []
		}

		const end = performance.now()
    debuggingMode && console.log(`PASSED  2 ${(end - start).toFixed(2)}ms`)
    
		return driversData
	} catch(e) {
		console.log('ASSIGN: Error while "getDrivers": ', e)
		return []
	}
}

module.exports = getDrivers