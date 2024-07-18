const { doc, onSnapshot } = require("firebase/firestore")
const { db } = require("../../config/firebase")

const DB_DOC_SUBSCRIBE = (collectionName, docId, callback) => {
	let unsub = null
	try {
		const docRef = doc(db, collectionName, docId)

		// Subscribe to document changes
		unsub = onSnapshot(
			docRef,
			(doc) => {
				if (doc.exists()) {
					callback({ data: doc.data(), unsub })
				} else {
					callback({ data: null, unsub })
				}
			},
			(error) => {
				console.error("Error in onSnapshot:", error)
			},
		)
	} catch (e) {
		console.error(e)
		return null
	}
}

module.exports = DB_DOC_SUBSCRIBE