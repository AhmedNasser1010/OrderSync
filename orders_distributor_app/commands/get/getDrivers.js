const { query, collection, where, getDocs } = require('firebase/firestore')
const { db } = require('../../config/firebase.js')
const { store, setValue } = require('../../store.js')

async function getDrivers() {
	try {
		const uid = store.user.values.userInfo.uid
  	const q = query(collection(db, "drivers"), where("partnerUid", "==", uid))
		const querySnapshot = await getDocs(q)
		const driversData = []

		querySnapshot.forEach(doc => {
			driversData.push(doc.data())
		})

		setValue('drivers', driversData)
		console.log(store.drivers.values)
	} catch(e) {
		console.log(e)
	}
}

module.exports = getDrivers