const { store } = require('../../store.js')
const { UPDATE_NESTED_VALUE } = require('../../utils/FIRESTORE/DB_CONTROLLERS.js')

const dueToZero = (dueNumMatch) => {
	const riderId = dueNumMatch[1]

	const driver = store.drivers.values.find(driver => driver.uid === riderId)

	if (!driver) {
		console.log('Rider ID not found!')
		return
	}

	if (driver.ordersDues === 0) {
		console.log('Rider dues is already 0')
		return
	}

	UPDATE_NESTED_VALUE('drivers', riderId, 'ordersDues', 0)
	.then(res => {
		if (res) {
			console.log(`Resetting dues for rider: ${riderId} to zero 0`)
		}
	})

}

module.exports = dueToZero