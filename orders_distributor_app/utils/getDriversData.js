const { GET_COLLECTION } = require('./FIRESTORE/DB_CONTROLLERS.js')

function getDriversData() {
	GET_COLLECTION('drivers')
	.then(res => {
		console.log(res)
		return
	})
}

module.exports = getDriversData