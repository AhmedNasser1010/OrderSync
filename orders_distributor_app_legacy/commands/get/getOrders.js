const { query, collection, where, getDocs } = require('firebase/firestore')
const { db } = require('../../config/firebase.js')
const { store, setValue } = require('../../store.js')

async function getOrders() {
	try {
		const businessIDs = store.user.values.data.businesses
  	const q = query(collection(db, "orders"), where("accessToken", "in", businessIDs))
		const querySnapshot = await getDocs(q)
		const ordersData = []

		querySnapshot.forEach(doc => {
			if (doc.data().open.length) {
				doc.data().open.map(order => ordersData.push(order))
			}
		})

		setValue('orders', ordersData)
		console.log(store.orders.values)
	} catch(e) {
		console.log(e)
	}
}

module.exports = getOrders