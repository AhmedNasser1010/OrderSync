const startMsg = require('./startMsg.js')
const { GET_DOC } = require('./FIRESTORE/DB_CONTROLLERS.js')
const { store, setState, setValue } = require('../store.js')
const { db } = require("../config/firebase")
const { doc, onSnapshot, collection, query, where, getDocs } = require("firebase/firestore")

async function onStartApp() {
	try {
		console.log('Starting...')
		setState('user')
		setState('restaurants')
		setState('drivers')
		
		const user = await GET_DOC('users', process.env.USER_ID)
		.then(res => {
			if (res) {
				setValue('user', res)
				return res
			}
			return null
		})
		.catch(e => {
			console.error('Error while app start get users data: ', e)
			return null
		})

		const businessIDs = user.data.businesses
  	const q = query(collection(db, "businesses"), where("accessToken", "in", businessIDs))
		const querySnapshot = await getDocs(q)

		querySnapshot.forEach(doc => {
			if (store.restaurants.values) {
				setValue('restaurants', [ ...store.restaurants.values, doc.data() ])
			} else {
				setValue('restaurants', [ doc.data() ])
			}
		})

		console.clear()
		startMsg()
	} catch(e) {
		console.error('Error while app start: ', e)
	}

}

module.exports = onStartApp