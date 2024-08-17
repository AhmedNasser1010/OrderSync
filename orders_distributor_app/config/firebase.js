const { initializeApp } = require('firebase/app')
const config = require('./config.js')
const { getFirestore } = require('firebase/firestore')

const { getAuth } = require("firebase/auth")

const firebase = initializeApp(config.firebaseConfig)
const db = getFirestore(firebase)
const auth = getAuth(firebase)

module.exports = {
	firebase,
	db,
	auth
}