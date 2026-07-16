const { query, collection, where, getDocs } = require('firebase/firestore')
const { db } = require('../../config/firebase.js')
const { store, setValue } = require('../../store.js')

async function getRestaurants() {
	try {
		const businessIDs = store.user.values.data.businesses
  	const q = query(collection(db, "businesses"), where("accessToken", "in", businessIDs))
		const querySnapshot = await getDocs(q)
		const resData = []

		querySnapshot.forEach(doc => {
			resData.push(doc.data())
		})

		setValue('restaurants', resData)
		console.log(store.restaurants.values)
	} catch(e) {
		console.log(e)
	}
}

module.exports = getRestaurants