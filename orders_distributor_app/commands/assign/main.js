const unknownCommand = require('../../utils/unknownCommand.js')
const assignTo = require('./assignTo')
const unassign = require('./unassign')
const assignReset = require('./assignReset')
const { GET_COLLECTION } = require('../../utils/FIRESTORE/DB_CONTROLLERS.js')
const { store, setValue } = require('../../store.js')
const { getFirestore, collection, query, where, getDocs } = require("firebase/firestore")
const { db } = require('../../config/firebase.js')

const assignToRegEx = /assign\s+([^\s]+)\s+to\s+([^\s]+)/
const unassignRegEx = /assign\s+([^\s]+)\s+remove\s+([^\s]+)/

async function assign(input) {
	try {
		const resIDs = store.user.values.data.businesses
  	const ordersQ = query(collection(db, "orders"), where("accessToken", "in", resIDs))
		const orderQuerySnapshot = await getDocs(ordersQ)
		let finalAllOrders = []

		const ordersData = orderQuerySnapshot.docs.map(doc => {
			doc.data().open.map(order => finalAllOrders.push(order))
		})


		const businessIDs = store.user.values.data.businesses
  	const busQ = query(collection(db, "businesses"), where("accessToken", "in", businessIDs))
		const querySnapshot = await getDocs(busQ)
		const finalResData = []

		querySnapshot.forEach(doc => {
			finalResData.push(doc.data())
		})

		const drivers = await GET_COLLECTION('drivers')

		setValue('orders', finalAllOrders)
		setValue('restaurants', finalResData)
		setValue('drivers', drivers)

		if (input === 'assign') {
			return
		} else if (input.match(assignToRegEx)) {
			const match = input.match(assignToRegEx)
	  	const orderId = match[1]
			const driverId = match[2]
	  	assignTo(orderId, driverId)
			return
		} else if (input.match(unassignRegEx)) {
			const match = input.match(unassignRegEx)
	  	const orderId = match[1]
			const driverId = match[2]
	  	unassign(orderId, driverId)
			return
		} else if (input === 'assign -reset') {
			assignReset()
			return
		}

		unknownCommand(input)
	} catch(e) {
		console.log('error', e)
	}
}

module.exports = assign