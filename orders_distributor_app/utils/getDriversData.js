const { GET_COLLECTION } = require('./FIRESTORE/DB_CONTROLLERS.js')
const { store } = require('../store.js')

function getDriversData() {
	// GET_COLLECTION('drivers')
	// .then(res => {
	// 	console.log(res)
	// 	return
	// })
	console.log(store.drivers.values)
}

module.exports = getDriversData