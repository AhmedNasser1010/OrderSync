const { onSnapshot, collection } = require("firebase/firestore")
const { db } = require('../config/firebase.js')
const { setValue } = require('../store.js')

function handleNoOnlineDrivers() {
	console.log('ASSIGN: Waiting for online drivers...')

	const unsub = onSnapshot(collection(db, "drivers"), querySnapshot => {
		const drivers = []

	  querySnapshot.forEach(doc => {
	  	drivers.push(doc.data())
	  })

	  const onlineDrivers = drivers.filter(driver => driver.online.byManager && driver.online.byUser)

	  if (onlineDrivers.length > 0) {
	  	unsub()
	  	setValue('drivers', drivers)
	  }
	  
	})
}

module.exports = handleNoOnlineDrivers