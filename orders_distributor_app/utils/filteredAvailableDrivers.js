const { performance } = require('perf_hooks')
const handleNoOnlineDrivers = require('./handleNoOnlineDrivers.js')
const { setSubscribe } = require('../store.js')
const { debuggingMode } = require('../constants.js')

async function filteredAvailableDrivers(drivers) {
	try {
		const start = performance.now()
		
		const onlineDrivers = await drivers.filter(driver => driver.online.byManager && driver.online.byUser)

		if (onlineDrivers.length === 0) {
			handleNoOnlineDrivers()

			setSubscribe((store) => {
				const onlineDrivers = store.drivers.values.filter(driver => driver.online.byManager && driver.online.byUser)

				const end = performance.now()
   			debuggingMode && console.log(`PASSED  3 ${(end - start).toFixed(2)}ms`)

				return onlineDrivers 
			}, ['drivers'])

		}

		const end = performance.now()
   	debuggingMode && console.log(`PASSED  3 ${(end - start).toFixed(2)}ms`)

		return onlineDrivers
	} catch(e) {
		console.log('ASSIGN: Error while "filteredAvailableDrivers": ', e)
		return []
	}
}

module.exports = filteredAvailableDrivers