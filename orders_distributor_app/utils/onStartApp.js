const startMsg = require('./startMsg.js')
const { GET_DOC } = require('./FIRESTORE/DB_CONTROLLERS.js')
const { store, setState, setValue } = require('../store.js')
const { db } = require("../config/firebase")
const { doc, onSnapshot, collection, query, where, getDocs } = require("firebase/firestore")
const loginUser = require('./loginUser.js')
const askQuestion = require('./askQuestion.js')

async function onStartApp() {
	try {
		setState('user')
		setState('restaurants')
		setState('drivers')

		const email = await askQuestion('Enter your email: ', 'testBusinessCreator@gmail.com')
		const password = await askQuestion('Enter your password: ', '123456')

		const userCredential = await loginUser(email, password)
		const userID = userCredential.uid
		
		console.clear()
		console.log('Starting...')

		const user = await GET_DOC('users', userID)
		setValue('user', user || undefined)

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