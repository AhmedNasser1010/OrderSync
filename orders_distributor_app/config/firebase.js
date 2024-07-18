const { initializeApp } = require('firebase/app')
const config = require('./config.js')
const { getFirestore } = require('firebase/firestore')

const firebase = initializeApp(config.firebaseConfig)
const db = getFirestore(firebase)

module.exports = {
	firebase,
	db
}