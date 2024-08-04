const { store } = require('../../store.js')
const { UPDATE_NESTED_VALUE } = require('../../utils/FIRESTORE/DB_CONTROLLERS.js')

const decreseNum = (dueNumMatch) => {
	const riderId = dueNumMatch[1]
	const minusNum = parseInt(dueNumMatch[2], 10)

	const driver = store.drivers.values.find(driver => driver.uid === riderId)

	if (!driver) {
		console.log('Rider ID not found!')
		return
	}

	if (!minusNum) {
		console.log('Minus number cannot be zero!')
		return
	}

	const finalDue = driver.ordersDues - minusNum

	if (driver.ordersDues === 0) {
		console.log('Rider dues is already 0')
		return
	}

	if (finalDue < 0) {
		console.log('Rider dues cannot set to minus number!')
		return
	}

	UPDATE_NESTED_VALUE('drivers', riderId, 'ordersDues', finalDue)
	.then(res => {
		if (res) {
			console.log(`Decreasing dues for rider: ${riderId} by ${minusNum}, Final due ${finalDue}`)
		}
	})

}

module.exports = decreseNum