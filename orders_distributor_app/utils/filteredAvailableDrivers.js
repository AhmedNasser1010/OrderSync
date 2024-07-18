const handleNoOnlineDrivers = require('./handleNoOnlineDrivers.js')
const { setSubscribe } = require('../store.js')


async function filteredAvailableDrivers(drivers) {
	try {
		const onlineDrivers = await drivers.filter(driver => driver.online.byManager && driver.online.byUser)

		if (onlineDrivers.length === 0) {
			handleNoOnlineDrivers()

			setSubscribe((store) => {
				const onlineDrivers = store.drivers.values.filter(driver => driver.online.byManager && driver.online.byUser)
				return onlineDrivers 
			}, ['drivers'])

		}

		return onlineDrivers
	} catch(e) {
		console.log('ASSIGN: Error while "filteredAvailableDrivers": ', e)
		return []
	}
}

module.exports = filteredAvailableDrivers