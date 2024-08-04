const { store } = require('../../store.js')

const displayDue = (displayMatch) => {
	const riderId = displayMatch[1]
	const driver = store.drivers.values.find(driver => driver.uid === riderId)

	if (!driver) {
		console.log('Rider ID not found!')
		return
	}

	console.log(`Displaying dues for rider: ${riderId} = ${driver.ordersDues}`)
}

module.exports = displayDue