const { GET_COLLECTION } = require('../../utils/FIRESTORE/DB_CONTROLLERS.js')
const { store, setValue } = require('../../store.js')

function getDrivers() {
	GET_COLLECTION('drivers')
	.then(res => {
		setValue('drivers', res)
		console.log(store.drivers.values)
	})
}

module.exports = getDrivers